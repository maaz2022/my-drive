"use client"

import { SignInButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { FileIcon, GridIcon, Loader2, RowsIcon, Search, StarIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import { api } from "../../../../convex/_generated/api";

import { columns } from "./columns";

import { DataTable } from "./file-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


function Placeholder(){
return(
  <div className="flex flex-col gap-4 w-full items-center mt-12">
  <Image alt="image" width="300" height="300" src="/empty.svg"/>
  <div className="text-2xl">
    You have no files, go upload one
  </div>
  <UploadButton/>
</div>  
)
}
export  function FileBrowser({title, favouritesOnly, deletedOnly}: {title:string, favouritesOnly?:boolean , deletedOnly?:boolean }) {
  const organization = useOrganization();
  const user = useUser();
  const[query, setQuery] = useState("");
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const[type,setType] = useState('all')

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favourites = useQuery(api.files.getAllFavorites, 
    orgId ? {orgId} : "skip"
  );

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favourites: favouritesOnly, deletedOnly } : 'skip');
  const isLoading = files === undefined;
  const modifiedFiles =
  files?.map((file) => ({
  ...file,
    isFavourited: (favourites ?? []).some(
    (favorite) => favorite.fileId === file._id
),
    })) ?? [];
  return (
      <div>
      {/* {!isLoading && !query && files.length === 0  && (
        <Placeholder/>
      )} */}
       
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery}/>
            <UploadButton/>
        </div>
  
        <Tabs defaultValue="grid" >
          <div className="flex justify-between items-center">
          <TabsList  className="mb-4">
            <TabsTrigger value="grid" className="flex gap-2 justify-center"><GridIcon/> grid</TabsTrigger>
            <TabsTrigger value="table"  className="flex gap-2 justify-center"><RowsIcon/> table</TabsTrigger>
        </TabsList>
        <div>
        <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Image</SelectItem>
              <SelectItem value="dark">CSV</SelectItem>
              <SelectItem value="system">PDF</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>
  
        {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-24 text-gray-500">
          <Loader2 className="h-32 w-32 animate-spin"/>
          <div className="text-2xl">Loading your files...</div>
        </div>  
      )}
          <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4">
                {modifiedFiles?.map((file) => {
             return (
                <FileCard  key={file._id} file={file}/>
              ) 
             })}
             
        </div>
          </TabsContent>
          <TabsContent value="table">  
            <DataTable columns={columns} data={modifiedFiles} />
          </TabsContent>
        </Tabs>    

        {files?.length === 0  && (<Placeholder/>)}
    </div>
  );
}
