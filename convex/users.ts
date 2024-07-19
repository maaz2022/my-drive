import { ConvexError, v } from "convex/values";
import { internalMutation, MutationCtx, QueryCtx } from "./_generated/server";

export async function getUser(ctx: QueryCtx | MutationCtx, tokenIdentifier: string){

    
    const user = await ctx.db.query("users").withIndex('by_tokenIdentifier',
         q => q.eq('tokenIdentifier', tokenIdentifier)).first()
         if(!user){
            console.error("User not found for tokenIdentifier:",tokenIdentifier);
            
            throw new ConvexError('Expected User to be defined')
        }
        console.log(user);
        
        return user
}
export const createUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
    },
    async handler(ctx, args) {
        await ctx.db.insert('users',{
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
            
        })
        
    },
})

export const addOrgIdToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
    },
    async handler(ctx, args) {
        const user = await getUser(ctx, args.tokenIdentifier)

        await ctx.db.patch(user._id, {
            orgIds: [...user.orgIds, args.orgId]   
        })
        
    },
})