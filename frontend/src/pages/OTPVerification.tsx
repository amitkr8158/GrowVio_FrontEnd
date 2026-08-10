import { Link } from "react-router-dom";

export default function OTPVerification() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Coming Soon</h1>
        <p className="text-muted-foreground">
          OTP verification is not yet available. Please check back later.
        </p>
        <Link to="/onboarding" className="text-primary underline underline-offset-4">
          Go to Onboarding
        </Link>
      </div>
    </div>
  );
}
