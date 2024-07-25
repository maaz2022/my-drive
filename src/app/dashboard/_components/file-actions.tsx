import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  

import { Button } from "@/components/ui/button"
import { Delete, DeleteIcon, FileIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TypeIcon, UndoIcon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation, useQuery } from "convex/react"

import { toast } from "@/components/ui/use-toast"

import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { Protect } from "@clerk/nextjs"

  

export function FileCardActions({file, isfavourited}: {file: Doc<"files">, isfavourited:boolean}){
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavourite = useMutation(api.files.toggleFavourite);
    const me = useQuery(api.users.getMe);
    return (
    <>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
    <AlertDialogContent>
        <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
        </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
        onClick={async ()=> {
              await deleteFile(
                {fileId:file._id
                });
                toast({
                    variant: "default",
                    title: "File has been marked for deletion",
                    description: "Your file has now gone in trash"
                  })
        }}
        >Continue</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
    </AlertDialog>

        <DropdownMenu>
        <DropdownMenuTrigger><MoreVertical/></DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuItem 
            onClick={() =>{
                toggleFavourite({
                    fileId: file._id,
                });
            }}
            className="flex gap-1 items-center cursor-pointer">
                {isfavourited ? 
                <div className="flex gap-1 items-center">
                <StarHalf className="w-4 h-4"/>
                Unfavourite  </div>  :
                <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4"/>
                 Favourite</div>
            } 
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem 
                    onClick={()=>{
                        window.open(getFileUrl(file.fileId), "_blank");
                    }}
            className="flex gap-1 items-center cursor-pointer">
                <FileIcon className="w-4 h-4"/>Download
            </DropdownMenuItem>


            <Protect condition={(check) => {
    return check({ role: "org:admin" }) || file.userId === me?._id;
}}

            fallback={<></>}>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="lex gap-1 items-center cursor-pointer"
                onClick={() => {
                    if(file.shouldDelete){
                        restoreFile({
                            fileId:file._id,
                        })
                    }else{
                        setIsConfirmOpen(true)
                    }
                }}>
                {file.shouldDelete ? 
                    (
                        <div className="flex gap-1 text-green-600 items-center"><UndoIcon className="w-4 h-4"/>
                            Restore
                        </div>
                    ) : (
                        <div className="flex gap-1 text-red-600 items-center"><DeleteIcon className="w-4 h-4"/>
                             Delete
                        </div>    
                    )
                }
                </DropdownMenuItem>
            </Protect>
        </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}




export function getFileUrl(fileId: Id<"_storage">): string{
    return `https://hearty-crocodile-183.convex.cloud/api/storage/${fileId}`;      
}


