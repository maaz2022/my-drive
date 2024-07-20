"use client"

import { Button } from "@/components/ui/button";
import { SignInButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip');
  const isLoading = files === undefined;
  return (
    <main className="container mx-auto pt-12">
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-24 text-gray-500">
          <Loader2 className="h-32 w-32 animate-spin"/>
          <div className="text-2xl">Loading your image...</div>
        </div>  
      )}
      {!isLoading && files.length ===0 && (
        <div className="flex flex-col gap-4 w-full items-center mt-12">
          <Image alt="image" width="300" height="300" src="/empty.svg"/>
          <div className="text-2xl">
            You have no files, go upload one
          </div>
          <UploadButton/>
        </div>
      )}
 
      {!isLoading && files.length > 0 && (
        <>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadButton/>
        </div>
        <div className="grid grid-cols-3 gap-4">
                {files?.map((file) => {
             return (
                <FileCard key={file._id} file={file}/>
              ) 
             })}
        </div>
          </>
      )}

    </main>
  );
}
