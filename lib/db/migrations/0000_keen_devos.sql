CREATE TABLE IF NOT EXISTS "User" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar(64) NOT NULL,
    "password" varchar(64),
    "type" varchar NOT NULL DEFAULT 'regular',
    "messageCount" json DEFAULT '{}' NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "User" ADD CONSTRAINT "User_type_check" 
    CHECK ("type" IN ('guest', 'regular'));

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Chat" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "createdAt" timestamp NOT NULL,
    "title" text NOT NULL,
    "userId" uuid NOT NULL,
    "visibility" varchar NOT NULL DEFAULT 'private'
);

ALTER TABLE "Chat" ADD CONSTRAINT "Chat_visibility_check"
    CHECK ("visibility" IN ('public', 'private'));

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
