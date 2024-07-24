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
import Image from "next/image"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { toggleFavourite } from "../../../../convex/files"
import { Protect } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
  

function FileCardActions({file, isfavourited}: {file: Doc<"files">, isfavourited:boolean}){
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const toggleFavourite = useMutation(api.files.toggleFavourite);
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


            <Protect role="org:admin" fallback={<></>}>
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




function getFileUrl(fileId: Id<"_storage">): string{
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;      
}



export function FileCard({file, favourites}: {file: Doc<"files">, favourites: Doc<"favourites">[]}){
    const iconTypes = {
        image: <ImageIcon/>,
         pdf: <FileTextIcon/>,
         csv: <GanttChartIcon/>
     } as Record<Doc<"files"> ["type"], ReactNode>;
    const userProfile = useQuery(api.users.getUserProfile,{
        userId: file.userId,
})
   
        const isfavourited = favourites.some((favourite) => favourite.fileId ===file._id);
    
    return (
        <Card>
            <CardHeader className="relative">
                 <CardTitle className="flex gap-3">
                 <div className="flex justify-center text-base font-normal">{iconTypes[file.type]}</div>{" "}
                     {file.name}</CardTitle>
                  <div className="absolute top-2 right-2"><FileCardActions isfavourited = {isfavourited} file={file} /></div> 
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {/* {file.type === "image" && (
                    <Image alt={file.name} width="200" height="100" src={getFileUrl(file.fileId)}/>     
                )} */}
                {file.type === "csv" && <GanttChartIcon className="w-20 h-20"/>}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20"/>}
                {file.type === "image" && <ImageIcon className="w-20 h-20"/>}
             </CardContent>
            <CardFooter className="flex justify-between">    
                <div className="flex gap-2 text-xs text-gray-500 w-40 items-center">
            <Avatar className="w-6 h-6">
                <AvatarImage src={userProfile?.image}/>
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {userProfile?.name}
            </div>
           <div className="text-xs text-gray-700"> uploaded on {formatRelative((new Date(file._creationTime)), new Date())}</div>
            </CardFooter>
        </Card>
   
    )
}