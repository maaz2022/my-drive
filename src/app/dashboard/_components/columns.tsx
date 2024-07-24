"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { FileCardActions } from "./file-actions"
import { formatRelative } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

function UserCell({ userId }: { userId: Id<"users"> }) {
    const userProfile = useQuery(api.users.getUserProfile, {
      userId: userId,
    });
    return (
      <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
        <Avatar className="w-6 h-6">
          <AvatarImage src={userProfile?.image} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        {userProfile?.name}
      </div>
    );
  }
export const columns: ColumnDef<Doc<"files"> & {isFavourited: boolean}>[] = [
    {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        header: "User",
        cell: ({ row }) => {
          return <UserCell userId={row.original.userId} />;
        },
      },
      {
        header: "Uploaded On",
        cell: ({ row }) => {
          return (
            <div>
              {formatRelative(new Date(row.original._creationTime), new Date())}
            </div>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div>
              <FileCardActions
                file={row.original}
                isfavourited={row.original.isFavourited}
              />
            </div>
          );
        },
      },
]
