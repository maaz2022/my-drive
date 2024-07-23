"use client"

import { SignInButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { FileIcon, Loader2, Search, StarIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import { api } from "../../../../convex/_generated/api";


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
export  function FileBrowser({title, favouritesOnly}: {title:string, favouritesOnly?:boolean  }) {
  const organization = useOrganization();
  const user = useUser();
  const[query, setQuery] = useState("");
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favourites = useQuery(api.files.getAllFavorites, 
    orgId ? {orgId} : "skip"
  );

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favourites: favouritesOnly } : 'skip');
  const isLoading = files === undefined;
  return (
      <div>
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-24 text-gray-500">
          <Loader2 className="h-32 w-32 animate-spin"/>
          <div className="text-2xl">Loading your image...</div>
        </div>  
      )}
      {/* {!isLoading && !query && files.length === 0  && (
        <Placeholder/>
      )} */}
    
      {!isLoading && (
        <>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery}/>
            <UploadButton/>
        </div>
     
        <div className="grid grid-cols-3 gap-4">
                {files?.map((file) => {
             return (
                <FileCard favourites = {favourites ?? []} key={file._id} file={file}/>
              ) 
             })}
             
        </div>
        {files.length === 0  && (
          <Placeholder/>
      )}
          </> 
      )}
    </div>
  );
}
