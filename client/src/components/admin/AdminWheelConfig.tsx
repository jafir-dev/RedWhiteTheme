import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  AlertCircle
} from "lucide-react";
import type { Prize, WheelConfig } from "@shared/schema";

const prizeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  value: z.string().min(1, "Value is required"),
  goldGrams: z.string().optional(),
  silverGrams: z.string().optional(),
  probability: z.string().min(1, "Probability is required"),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PrizeFormValues = z.infer<typeof prizeFormSchema>;

export default function AdminWheelConfig() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const { data: prizes = [], isLoading: prizesLoading } = useQuery<Prize[]>({
    queryKey: ["/api/prizes"],
  });

  const { data: wheelConfig, isLoading: configLoading } = useQuery<WheelConfig>({
    queryKey: ["/api/wheel/config"],
  });

  const form = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "discount",
      value: "",
      goldGrams: "",
      silverGrams: "",
      probability: "10",
      color: "#DC2626",
      isActive: true,
    },
  });

  const createPrizeMutation = useMutation({
    mutationFn: async (values: PrizeFormValues) => {
      const res = await apiRequest("POST", "/api/admin/prizes", {
        ...values,
        value: parseFloat(values.value),
        goldGrams: values.goldGrams ? parseFloat(values.goldGrams) : 0,
        silverGrams: values.silverGrams ? parseFloat(values.silverGrams) : 0,
        probability: parseFloat(values.probability),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      toast({ title: "Prize created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePrizeMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: PrizeFormValues }) => {
      const res = await apiRequest("PATCH", `/api/admin/prizes/${id}`, {
        ...values,
        value: parseFloat(values.value),
        goldGrams: values.goldGrams ? parseFloat(values.goldGrams) : 0,
        silverGrams: values.silverGrams ? parseFloat(values.silverGrams) : 0,
        probability: parseFloat(values.probability),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      toast({ title: "Prize updated successfully" });
      setIsDialogOpen(false);
      setEditingPrize(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePrizeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/prizes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
      toast({ title: "Prize deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateProbabilityMutation = useMutation({
    mutationFn: async ({ id, probability }: { id: number; probability: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/prizes/${id}`, { probability });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prizes"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    form.reset({
      name: prize.name,
      description: prize.description || "",
      type: prize.type,
      value: prize.value.toString(),
      goldGrams: prize.goldGrams?.toString() || "",
      silverGrams: prize.silverGrams?.toString() || "",
      probability: prize.probability.toString(),
      color: prize.color || "#DC2626",
      isActive: prize.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: PrizeFormValues) => {
    if (editingPrize) {
      updatePrizeMutation.mutate({ id: editingPrize.id, values });
    } else {
      createPrizeMutation.mutate(values);
    }
  };

  const totalProbability = prizes.reduce((sum, p) => sum + (p.probability || 0), 0);
  const isProbabilityValid = Math.abs(totalProbability - 100) < 0.1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Wheel Configuration</h1>
          <p className="text-muted-foreground">
            Manage prizes and probability settings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingPrize(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-prize">
              <Plus className="w-4 h-4 mr-2" />
              Add Prize
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPrize ? "Edit Prize" : "Add New Prize"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Name</FormLabel>
                      <FormControl>
                        <Input placeholder="1 Gram Gold Free" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free_gold">Free Gold</SelectItem>
                          <SelectItem value="free_silver">Free Silver</SelectItem>
                          <SelectItem value="combo">Combo Offer</SelectItem>
                          <SelectItem value="discount">Discount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value (Rs)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Probability (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="goldGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gold (grams)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="silverGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Silver (grams)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Active</FormLabel>
                        <FormDescription className="text-xs">
                          Show this prize on the wheel
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createPrizeMutation.isPending || updatePrizeMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingPrize ? "Update Prize" : "Create Prize"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Probability Warning */}
      {!isProbabilityValid && prizes.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Probability Warning
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Total probability is {totalProbability.toFixed(1)}%. It should equal 100%.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prizes Grid */}
      {prizesLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : prizes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No Prizes Configured</h3>
            <p className="text-muted-foreground mb-4">
              Add prizes to configure your fortune wheel
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className={!prize.isActive ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{prize.name}</CardTitle>
                    {!prize.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <CardDescription>{prize.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditPrize(prize)}
                    data-testid={`button-edit-prize-${prize.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePrizeMutation.mutate(prize.id)}
                    data-testid={`button-delete-prize-${prize.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="capitalize">
                    {prize.type.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">Rs {prize.value}</span>
                </div>
                {(prize.goldGrams || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gold:</span>
                    <span className="font-medium">{prize.goldGrams}g</span>
                  </div>
                )}
                {(prize.silverGrams || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Silver:</span>
                    <span className="font-medium">{prize.silverGrams}g</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Probability:</span>
                    <span className="font-medium">{prize.probability}%</span>
                  </div>
                  <Slider
                    value={[prize.probability]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => {
                      updateProbabilityMutation.mutate({ id: prize.id, probability: value });
                    }}
                    className="w-full"
                    data-testid={`slider-probability-${prize.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
