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
  
import { Doc } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Delete, DeleteIcon, MoreVertical } from "lucide-react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { toast } from "@/components/ui/use-toast"
  

function FileCardActions({file}: {file: Doc<"files">}){
    const deleteFile = useMutation(api.files.deleteFile);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
                    title: "File has been Deleted",
                    description: "Your file has now gone from the system"
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
            onClick={() => setIsConfirmOpen(true)}
            className="flex gap-1 text-red-600 items-center"><DeleteIcon className="w-4 h-4"/> Delete</DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </>
    )
}

export function FileCard({file}: {file: Doc<"files">}){
    return (
        <Card>
            <CardHeader className="relative">
                 <CardTitle> {file.name}</CardTitle>
                  <div className="absolute top-2 right-2"><FileCardActions file={file} /></div> 
            </CardHeader>
            <CardContent>
                    <p>Card Content</p>
             </CardContent>
            <CardFooter>
                    <Button>Download</Button>
            </CardFooter>
        </Card>

    )
}