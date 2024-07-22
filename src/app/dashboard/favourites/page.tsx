import { useQuery } from "convex/react";
import { FileBrowser } from "../_components/file-browser";
import { query } from "../../../../convex/_generated/server";
import { api } from "../../../../convex/_generated/api";

export default function FavouritesPage(){

    return <div>
         <FileBrowser title="Favourites" favourites/>
    </div>
}