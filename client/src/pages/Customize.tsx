import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Coins,
  ArrowLeft,
  Upload,
  Image,
  Sparkles,
  Phone,
  Scale,
  FileText,
  CheckCircle,
  LogOut,
  Settings,
  X
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const customizeFormSchema = z.object({
  type: z.enum(["loan", "customization"]),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  goldWeightEstimate: z.string().optional(),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
});

type CustomizeFormValues = z.infer<typeof customizeFormSchema>;

export default function Customize() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<CustomizeFormValues>({
    resolver: zodResolver(customizeFormSchema),
    defaultValues: {
      type: "customization",
      description: "",
      goldWeightEstimate: "",
      contactPhone: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to log in to submit a request.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const submitMutation = useMutation({
    mutationFn: async (values: CustomizeFormValues) => {
      const res = await apiRequest("POST", "/api/loan-requests", {
        ...values,
        goldWeightEstimate: values.goldWeightEstimate ? parseFloat(values.goldWeightEstimate) : null,
        imageUrl: uploadedImage,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "Our team will contact you shortly.",
      });
      form.reset();
      setUploadedImage(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: CustomizeFormValues) => {
    submitMutation.mutate(values);
  };

  const requestType = form.watch("type");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl">Golden Fortune</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md">
              Products
            </Link>
            <Link href="/customize" className="text-sm font-medium bg-primary/10 text-primary px-3 py-2 rounded-md">
              Customize
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <a href="/api/logout">
                    <LogOut className="w-4 h-4" />
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Custom Jewelry & Gold Loan
            </CardTitle>
            <CardDescription>
              Submit your jewelry design or apply for a gold loan. Our team will contact you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Request Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What would you like to do?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div>
                            <RadioGroupItem
                              value="customization"
                              id="customization"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="customization"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              data-testid="radio-customization"
                            >
                              <Sparkles className="w-6 h-6 mb-2 text-primary" />
                              <span className="font-medium">Custom Jewelry</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Design your own piece
                              </span>
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem
                              value="loan"
                              id="loan"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="loan"
                              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 cursor-pointer peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              data-testid="radio-loan"
                            >
                              <Coins className="w-6 h-6 mb-2 text-primary" />
                              <span className="font-medium">Gold Loan</span>
                              <span className="text-xs text-muted-foreground text-center mt-1">
                                Get loan on gold
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Upload Image (Optional)
                  </Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      data-testid="input-file-upload"
                    />
                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute -top-2 -right-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedImage(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop an image or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {requestType === "loan"
                            ? "Upload a photo of your gold jewelry"
                            : "Upload a design reference or inspiration"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {requestType === "loan" ? "Describe your jewelry" : "Design description"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            requestType === "loan"
                              ? "Describe the gold jewelry you want to use as collateral..."
                              : "Describe your custom jewelry design, materials, specifications..."
                          }
                          className="min-h-[120px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gold Weight Estimate */}
                <FormField
                  control={form.control}
                  name="goldWeightEstimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Estimated Gold Weight (grams)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 10.5"
                          {...field}
                          data-testid="input-gold-weight"
                        />
                      </FormControl>
                      <FormDescription>
                        Approximate weight if known
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          {...field}
                          data-testid="input-contact-phone"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll call you to discuss the details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {submitMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
