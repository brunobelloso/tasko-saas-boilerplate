"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/invite-actions";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (result?.error) {
        setStatus("error");
        setMessage(result.error);
      } else if (result?.success) {
        setStatus("success");
        setMessage(result.success);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You have been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {status === "idle" && (
            <p className="text-sm text-muted-foreground mb-4">
              Click below to accept the invitation and join the team.
            </p>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm text-muted-foreground">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-sm text-destructive">{message}</p>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center gap-2">
          {status === "idle" && (
            <Button onClick={handleAccept} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => router.push("/login")}>
              Go to Sign In
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
