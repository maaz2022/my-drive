import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
        throw new ConvexError("go and logged in first");
    }
    console.log("Generating upload URL");
    return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
        return null;
    }
    const user = await ctx.db.query("users")
        .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", 
        identity.tokenIdentifier)).first();

    if (!user) {
        return null;
    }
    const hasAccess = user.orgIds.some((item) => item.orgId === orgId) || user.tokenIdentifier.includes(orgId);
    if (!hasAccess) {
        return null;
    }

    return { user };
}

export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: fileTypes,
    },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);
        if (!hasAccess) {
            throw new ConvexError("you do not have any access to this org");
        }
        console.log("Creating file with ID:", args.fileId);
        await ctx.db.insert("files", {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type,
            userId: hasAccess.user._id
        });
    },
});

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favourites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional(fileTypes),
    },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);
        if (!hasAccess) {
            return [];
        }

        let files = await ctx.db.query("files")
            .withIndex("by_orgId", q => q.eq('orgId', args.orgId))
            .collect();
        const query = args.query;
        if (query) {
            files = files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
        }

        if (args.favourites) {
            const favourites = await ctx.db.query("favourites")
                .withIndex("by_userId_fileId_orgId", q => q.eq("userId", hasAccess.user?._id).eq("orgId", args.orgId))
                .collect();
            files = files.filter((file) => favourites.some((favourite) => favourite.fileId === file._id));
        }

        if (args.deletedOnly) {
            files = files.filter((file) => file.shouldDelete);
        } else {
            files = files.filter((file) => !file.shouldDelete);
        }

        if (args.type) {
            files = files.filter((file) => file.type === args.type);
        }


        return files;
    },
});


export const deleteAllFiles = internalMutation({
    args: {},
    async handler(ctx) {
        console.log("deleteAllFiles cron job started");

        try {
            const files = await ctx.db
                .query("files")
                .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
                .collect();

            console.log(`Found ${files.length} files to delete`);

            await Promise.all(
                files.map(async (file) => {
                    console.log("Deleting file with ID:", file.fileId);
                    await ctx.storage.delete(file.fileId);
                    await ctx.db.delete(file._id);
                    
                })
            );

            console.log("deleteAllFiles cron job completed successfully");
        } catch (error) {
            console.error("Error in deleteAllFiles cron job:", error);
        }
    },
});


function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
    const canDelete = file.userId === user._id || user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";

    if (!canDelete) {
        throw new ConvexError("you have no access to delete this file");
    }
}

export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError("no access to file");
        }


        assertCanDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: true,
        });
    },
});

export const restoreFile = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError("no access to file");
        }


        assertCanDeleteFile(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: false,
        });
    },
});

export const toggleFavourite = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if (!access) {
            throw new ConvexError("no access to file");
        }

        const favourite = await ctx.db.query("favourites")
            .withIndex("by_userId_fileId_orgId", (q) => q.eq("userId", access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id))
            .first();

        if (!favourite) {

            await ctx.db.insert("favourites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId,
            });
        } else {

            await ctx.db.delete(favourite._id);
        }
    }
});

export const getAllFavorites = query({
    args: { orgId: v.string() },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);

        if (!hasAccess) {
            return [];
        }

        const favorites = await ctx.db
            .query("favourites")
            .withIndex("by_userId_fileId_orgId", (q) => q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId))
            .collect();


        return favorites;
    },
});

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
    const file = await ctx.db.get(fileId);
    if (!file) {
        return null;
    }
    const hasAccess = await hasAccessToOrg(ctx, file.orgId);

    if (!hasAccess) {
        return null;
    }


    return { user: hasAccess.user, file };
}

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  async handler(ctx, args) {
      return ctx.storage.getUrl(args.fileId);
  },
});