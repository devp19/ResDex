import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
export { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseClientOptionsWithoutAuth, CookieOptionsWithName } from '@supabase/auth-helpers-shared';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

declare function createClientComponentClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>({ supabaseUrl, supabaseKey, options, cookieOptions, isSingleton }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
    isSingleton?: boolean;
}): SupabaseClient<Database, SchemaName, Schema>;

declare const createPagesBrowserClient: typeof createClientComponentClient;

declare function createPagesServerClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: GetServerSidePropsContext | {
    req: NextApiRequest;
    res: NextApiResponse;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema>;

declare function createMiddlewareClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: {
    req: NextRequest;
    res: NextResponse;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema>;

declare function createServerComponentClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: {
    cookies: () => ReturnType<typeof cookies>;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema>;

declare function createRouteHandlerClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: {
    cookies: () => ReturnType<typeof cookies>;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema>;

declare const createServerActionClient: typeof createRouteHandlerClient;

/**
 * @deprecated utilize the `createPagesBrowserClient` function instead
 */
declare function createBrowserSupabaseClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>({ supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): _supabase_supabase_js.SupabaseClient<Database, SchemaName, Schema>;
/**
 * @deprecated utilize the `createPagesServerClient` function instead
 */
declare function createServerSupabaseClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: GetServerSidePropsContext | {
    req: NextApiRequest;
    res: NextApiResponse;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): _supabase_supabase_js.SupabaseClient<Database, SchemaName, Schema>;
/**
 * @deprecated utilize the `createMiddlewareClient` function instead
 */
declare function createMiddlewareSupabaseClient<Database = any, SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database, Schema extends GenericSchema = Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any>(context: {
    req: NextRequest;
    res: NextResponse;
}, { supabaseUrl, supabaseKey, options, cookieOptions }?: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
}): _supabase_supabase_js.SupabaseClient<Database, SchemaName, Schema>;

export { createBrowserSupabaseClient, createClientComponentClient, createMiddlewareClient, createMiddlewareSupabaseClient, createPagesBrowserClient, createPagesServerClient, createRouteHandlerClient, createServerActionClient, createServerComponentClient, createServerSupabaseClient };
