import Link from "next/link";
import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a confirmation link
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          Please check your email and click the confirmation link to verify your
          account. You can close this page.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button asChild>
          <Link href="/login">Go to Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
