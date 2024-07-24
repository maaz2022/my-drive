import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"


import { Delete, DeleteIcon, FileIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TypeIcon, UndoIcon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation, useQuery } from "convex/react"


import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { FileCardActions } from "./file-actions"
  
export function FileCard({file}: {file: Doc<"files"> & {isFavourited: boolean}}){
    const iconTypes = {
        image: <ImageIcon/>,
         pdf: <FileTextIcon/>,
         csv: <GanttChartIcon/>
     } as Record<Doc<"files"> ["type"], ReactNode>;
    const userProfile = useQuery(api.users.getUserProfile,{
        userId: file.userId,
})
   
        // const isfavourited = favourites.some((favourite) => favourite.fileId ===file._id);
    
    return (
        <Card>
            <CardHeader className="relative">
                 <CardTitle className="flex gap-3">
                 <div className="flex justify-center text-base font-normal">{iconTypes[file.type]}</div>{" "}
                     {file.name}</CardTitle>
                  <div className="absolute top-2 right-2"><FileCardActions isfavourited = {file.isFavourited} file={file} /></div> 
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