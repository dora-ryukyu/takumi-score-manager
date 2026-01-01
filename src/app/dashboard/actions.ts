'use server'

import { getDb } from "@/lib/d1";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// This file previously contained addDummyScore for debugging.
// It has been removed for production. If needed in the future,
// add new server actions here.

