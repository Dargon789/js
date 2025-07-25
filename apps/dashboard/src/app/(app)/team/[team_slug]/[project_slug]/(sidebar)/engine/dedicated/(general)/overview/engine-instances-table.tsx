"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  CheckIcon,
  CircleAlertIcon,
  DatabaseIcon,
  InfinityIcon,
  InfoIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Team } from "@/api/team";
import { CheckoutButton } from "@/components/billing/billing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxWithLabel } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type DeleteCloudHostedEngineParams,
  deleteCloudHostedEngine,
  type EditEngineInstanceParams,
  type EngineInstance,
  editEngineInstance,
  type RemoveEngineFromDashboardIParams,
  removeEngineFromDashboard,
} from "@/hooks/useEngine";
import { EngineIcon } from "@/icons/EngineIcon";
import { useDashboardRouter } from "@/lib/DashboardRouter";
import { cn } from "@/lib/utils";

type DeletedCloudHostedEngine = (
  params: DeleteCloudHostedEngineParams,
) => Promise<void>;

type EditedEngineInstance = (params: EditEngineInstanceParams) => Promise<void>;

type RemovedEngineFromDashboard = (
  params: RemoveEngineFromDashboardIParams,
) => Promise<void>;

export function EngineInstancesTable(props: {
  team: Team;
  projectSlug: string;
  instances: EngineInstance[];
  engineLinkPrefix: string;
}) {
  const router = useDashboardRouter();

  return (
    <EngineInstancesTableUI
      deleteCloudHostedEngine={async (params) => {
        await deleteCloudHostedEngine(params);
        router.refresh();
      }}
      editEngineInstance={async (params) => {
        await editEngineInstance(params);
        router.refresh();
      }}
      engineLinkPrefix={props.engineLinkPrefix}
      instances={props.instances}
      projectSlug={props.projectSlug}
      removeEngineFromDashboard={async (params) => {
        await removeEngineFromDashboard(params);
        router.refresh();
      }}
      team={props.team}
    />
  );
}

function DedicatedEngineSubscriptionButton(props: { team: Team }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const trigger = (
    <Button size="sm">
      <DatabaseIcon className="mr-2 size-4" />
      Deploy Dedicated Engine
    </Button>
  );

  const title = (
    <div className="flex flex-row items-center gap-2">
      <div className="grid size-8 place-items-center rounded-full bg-warning-text">
        <DatabaseIcon className="size-4 text-white" />
      </div>
      <span className="font-semibold text-lg">Dedicated Engine</span>
    </div>
  );

  const content = (
    <div className="flex flex-col items-start justify-center gap-4 px-4 md:px-0">
      <ul className="flex flex-col gap-1 self-start text-muted-foreground text-sm">
        <li className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-foreground" />
          Isolated environment
        </li>
        <li className="flex items-center gap-2">
          <WalletIcon className="size-4 text-foreground" />
          EOA or Smart Wallets
        </li>
        <li className="flex items-center gap-2">
          <InfinityIcon className="size-4 text-foreground" />
          No usage limits or charges
        </li>
      </ul>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
              Instantly deploy a dedicated engine instance for your team.
            </DrawerDescription>
          </DrawerHeader>
          {content}
          <DrawerFooter>
            <CheckoutButton
              billingStatus={props.team.billingStatus}
              sku="product:engine_standard"
              teamSlug={props.team.slug}
            >
              Deploy Now · $299 / month
            </CheckoutButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Instantly deploy a dedicated engine instance for your team.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <CheckoutButton
            billingStatus={props.team.billingStatus}
            sku="product:engine_standard"
            teamSlug={props.team.slug}
          >
            Deploy Now · $299 / month
          </CheckoutButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EngineInstancesTableUI(props: {
  instances: EngineInstance[];
  engineLinkPrefix: string;
  deleteCloudHostedEngine: DeletedCloudHostedEngine;
  editEngineInstance: EditedEngineInstance;
  removeEngineFromDashboard: RemovedEngineFromDashboard;
  team: Team;
  projectSlug: string;
}) {
  return (
    <div className="flex grow flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="font-semibold text-2xl tracking-tight">
          Engine Instances
        </h2>
        <DedicatedEngineSubscriptionButton team={props.team} />
      </div>

      {props.instances.length === 0 ? (
        <EmptyEngineState projectSlug={props.projectSlug} team={props.team} />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">Engine Instance</TableHead>
                <TableHead className="w-[100px]">Version</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.instances.map((instance) => (
                <EngineInstanceRow
                  deleteCloudHostedEngine={props.deleteCloudHostedEngine}
                  editEngineInstance={props.editEngineInstance}
                  engineLinkPrefix={props.engineLinkPrefix}
                  instance={instance}
                  key={instance.id}
                  removeEngineFromDashboard={props.removeEngineFromDashboard}
                  teamIdOrSlug={props.team.slug}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

function EngineInstanceRow(props: {
  teamIdOrSlug: string;
  instance: EngineInstance;
  engineLinkPrefix: string;
  deleteCloudHostedEngine: DeletedCloudHostedEngine;
  editEngineInstance: EditedEngineInstance;
  removeEngineFromDashboard: RemovedEngineFromDashboard;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const { instance, engineLinkPrefix } = props;

  return (
    <>
      <TableRow
        className={instance.status === "active" ? "hover:bg-accent/50" : ""}
        linkBox
      >
        <TableCell>
          <div className="flex items-center justify-between">
            <div className="flex-grow space-y-0.5">
              <InstanceNameLink
                engineLinkPrefix={engineLinkPrefix}
                instance={instance}
              />
              <EngineURL url={instance.url} />
            </div>
            {instance.status !== "active" && (
              <div>
                <EngineStatusBadge status={instance.status} />
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="warning">v2</Badge>
        </TableCell>
        <TableCell className="relative z-10 w-[50px]">
          <EngineActionsDropdown
            instance={instance}
            onEdit={() => setIsEditModalOpen(true)}
            onRemove={() => setIsRemoveModalOpen(true)}
          />
        </TableCell>
      </TableRow>

      <EditModal
        editEngineInstance={props.editEngineInstance}
        instance={instance}
        onOpenChange={setIsEditModalOpen}
        open={isEditModalOpen}
        teamIdOrSlug={props.teamIdOrSlug}
      />

      <RemoveModal
        deleteCloudHostedEngine={props.deleteCloudHostedEngine}
        instance={instance}
        onOpenChange={setIsRemoveModalOpen}
        open={isRemoveModalOpen}
        removeEngineFromDashboard={props.removeEngineFromDashboard}
        teamIdOrSlug={props.teamIdOrSlug}
      />
    </>
  );
}

function InstanceNameLink(props: {
  instance: EngineInstance;
  engineLinkPrefix: string;
}) {
  const name = (
    <span className="font-medium text-base tracking-tight">
      {props.instance.name}
    </span>
  );
  return (
    <div className="flex flex-col gap-0.5">
      {props.instance.status === "requested" ||
      props.instance.status === "deploying" ||
      props.instance.status === "deploymentFailed" ||
      props.instance.status === "paymentFailed" ? (
        <span>{name}</span>
      ) : (
        <Link
          className="flex items-center text-foreground before:absolute before:inset-0 before:bg-transparent"
          href={`${props.engineLinkPrefix}/${props.instance.id}`}
        >
          {name}
        </Link>
      )}
    </div>
  );
}

function EngineURL(props: { url: string }) {
  const cleanedURL = props.url.endsWith("/")
    ? props.url.slice(0, -1)
    : props.url;

  return <p className="text-muted-foreground text-xs">{cleanedURL}</p>;
}

const engineStatusMeta: Record<
  EngineInstance["status"],
  {
    label: string;
    variant: BadgeProps["variant"];
    icon: React.FC<{ className?: string }>;
  }
> = {
  active: {
    icon: CheckIcon,
    label: "Active",
    variant: "default",
  },
  deploying: {
    icon: Spinner,
    label: "Deploying",
    variant: "default",
  },
  deploymentFailed: {
    icon: CircleAlertIcon,
    label: "Deployment Failed",
    variant: "destructive",
  },
  paymentFailed: {
    icon: CircleAlertIcon,
    label: "Payment Failed",
    variant: "destructive",
  },
  pending: {
    icon: Spinner,
    label: "Pending",
    variant: "outline",
  },
  requested: {
    icon: Spinner,
    label: "Pending",
    variant: "outline",
  },
};

function EngineStatusBadge(props: { status: EngineInstance["status"] }) {
  const statusMeta = engineStatusMeta[props.status];
  return (
    <Badge className="gap-2 px-3 py-2" variant={statusMeta.variant}>
      <statusMeta.icon className="size-3" />
      {statusMeta.label}
    </Badge>
  );
}

function EngineActionsDropdown(props: {
  instance: EngineInstance;
  onEdit: (instance: EngineInstance) => void;
  onRemove: (instance: EngineInstance) => void;
}) {
  const canDelete =
    props.instance.status === "paymentFailed" ||
    props.instance.status === "deploymentFailed" ||
    props.instance.status === "active" ||
    !!props.instance.deploymentId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-10 p-1" variant="ghost">
          <MoreHorizontalIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="gap-2"
          onClick={() => {
            props.onEdit(props.instance);
          }}
        >
          <PencilIcon className="size-4" />
          Edit
        </DropdownMenuItem>

        {/* plan engine is not removable */}
        {!props.instance.isPlanEngine && (
          <DropdownMenuItem
            className="gap-2 text-destructive"
            disabled={!canDelete}
            onClick={() => {
              props.onRemove(props.instance);
            }}
          >
            <Trash2Icon className="size-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditModal(props: {
  open: boolean;
  teamIdOrSlug: string;
  onOpenChange: (open: boolean) => void;
  instance: EngineInstance;
  editEngineInstance: EditedEngineInstance;
}) {
  return (
    <Dialog onOpenChange={props.onOpenChange} open={props.open}>
      <DialogContent className="overflow-hidden p-0">
        <EditModalContent
          closeModal={() => props.onOpenChange(false)}
          editEngineInstance={props.editEngineInstance}
          instance={props.instance}
          teamIdOrSlug={props.teamIdOrSlug}
        />
      </DialogContent>
    </Dialog>
  );
}

const editEngineFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL"),
});

function EditModalContent(props: {
  teamIdOrSlug: string;
  instance: EngineInstance;
  editEngineInstance: EditedEngineInstance;
  closeModal: () => void;
}) {
  const editInstance = useMutation({
    mutationFn: props.editEngineInstance,
  });
  const { instance } = props;

  const form = useForm<z.infer<typeof editEngineFormSchema>>({
    resolver: zodResolver(editEngineFormSchema),
    reValidateMode: "onChange",
    values: {
      name: instance.name,
      url: instance.url,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          editInstance.mutate(
            {
              instanceId: props.instance.id,
              name: data.name,
              teamIdOrSlug: props.teamIdOrSlug,
              url: data.url,
            },
            {
              onError: () => {
                toast.error("Failed to update Engine");
              },
              onSuccess: () => {
                toast.success("Engine updated successfully");
                props.closeModal();
              },
            },
          ),
        )}
      >
        <div className="flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Edit Engine Instance</DialogTitle>
          </DialogHeader>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-card"
                    placeholder="Enter a descriptive label"
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* cloud hosted engine url is not editable */}
          {!props.instance.isCloudHosted && (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-card"
                      placeholder="Enter your Engine URL"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3 border-t bg-card p-6">
          <Button onClick={() => props.closeModal()} variant="outline">
            Close
          </Button>
          <Button
            className="gap-2"
            disabled={!form.formState.isDirty}
            type="submit"
          >
            {editInstance.isPending && <Spinner className="size-4" />}
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
}

function RemoveModal(props: {
  teamIdOrSlug: string;
  instance: EngineInstance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteCloudHostedEngine: DeletedCloudHostedEngine;
  removeEngineFromDashboard: RemovedEngineFromDashboard;
}) {
  const { instance, open, onOpenChange } = props;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="overflow-hidden p-0">
        {instance.status === "paymentFailed" ||
        instance.status === "deploymentFailed" ||
        (instance.status === "active" && !instance.deploymentId) ? (
          <RemoveEngineFromDashboardModalContent
            close={() => onOpenChange(false)}
            instance={instance}
            removeEngineFromDashboard={props.removeEngineFromDashboard}
            teamIdOrSlug={props.teamIdOrSlug}
          />
        ) : instance.deploymentId ? (
          <DeleteEngineSubscriptionModalContent
            close={() => onOpenChange(false)}
            deleteCloudHostedEngine={props.deleteCloudHostedEngine}
            instance={instance}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RemoveEngineFromDashboardModalContent(props: {
  teamIdOrSlug: string;
  instance: EngineInstance;
  close: () => void;
  removeEngineFromDashboard: RemovedEngineFromDashboard;
}) {
  const { instance, close } = props;
  const removeFromDashboard = useMutation({
    mutationFn: props.removeEngineFromDashboard,
  });

  return (
    <div>
      <div className="p-6">
        <DialogHeader>
          <DialogTitle>Remove Engine from Dashboard</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            <span className="mb-2 block">
              Are you sure you want to remove{" "}
              <em className="font-semibold not-italic">{instance.name}</em> from
              your dashboard?
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="h-2" />

        <Alert variant="info">
          <InfoIcon className="size-5" />
          <AlertTitle className="text-sm">
            This action does not modify your Engine infrastructure
          </AlertTitle>
          <AlertDescription className="mt-0.5 text-sm">
            You can import engine to dashboard again later
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-end gap-3 border-t bg-card p-6">
        <Button onClick={close} variant="outline">
          Close
        </Button>
        <Button
          className="gap-2"
          onClick={() => {
            removeFromDashboard.mutate(
              {
                instanceId: instance.id,
                teamIdOrSlug: props.teamIdOrSlug,
              },
              {
                onError: () => {
                  toast.error(
                    "Error removing an Engine instance from your dashboard",
                  );
                },
                onSuccess: () => {
                  toast.success(
                    "Removed an Engine instance from your dashboard",
                  );
                  close();
                },
              },
            );
          }}
          variant="destructive"
        >
          {removeFromDashboard.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
          Remove
        </Button>
      </div>
    </div>
  );
}

const deleteEngineReasons: Array<{
  value: DeleteCloudHostedEngineParams["reason"];
  label: string;
}> = [
  { label: "Migrating to self-hosted", value: "USING_SELF_HOSTED" },
  { label: "Too expensive", value: "TOO_EXPENSIVE" },
  { label: "Missing features", value: "MISSING_FEATURES" },
  { label: "Other", value: "OTHER" },
];

const deleteEngineFormSchema = z.object({
  confirmDeletion: z.boolean(),
  feedback: z.string(),
  reason: z.enum([
    "USING_SELF_HOSTED",
    "TOO_EXPENSIVE",
    "MISSING_FEATURES",
    "OTHER",
  ]),
});

function DeleteEngineSubscriptionModalContent(props: {
  instance: EngineInstance;
  close: () => void;
  deleteCloudHostedEngine: DeletedCloudHostedEngine;
}) {
  const { instance, close } = props;
  const deleteCloudHostedEngine = useMutation({
    mutationFn: props.deleteCloudHostedEngine,
  });

  const form = useForm<z.infer<typeof deleteEngineFormSchema>>({
    defaultValues: {
      confirmDeletion: false,
      feedback: "",
    },
    resolver: zodResolver(deleteEngineFormSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = (data: z.infer<typeof deleteEngineFormSchema>) => {
    // unexpected state
    if (!instance.deploymentId) {
      toast.error("Can not delete this Engine instance", {
        description: "Engine instance is missing deployment id",
      });
      return;
    }

    deleteCloudHostedEngine.mutate(
      {
        deploymentId: instance.deploymentId,
        feedback: data.feedback,
        reason: data.reason,
      },
      {
        onError: () => {
          toast.error(
            "Error deleting Engine. Please visit https://thirdweb.com/support.",
          );
        },
        onSuccess: () => {
          toast.success(
            "Deleting Engine. Please check again in a few minutes.",
            {
              dismissible: true,
              duration: 10000,
            },
          );

          close();
        },
      },
    );
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6">
            <DialogHeader className="mb-2">
              <DialogTitle>Permanently Delete Engine</DialogTitle>
            </DialogHeader>

            <p className="mb-3 text-muted-foreground text-sm">
              This step will cancel your monthly subscription and immediately
              delete all data and infrastructure for this Engine.
            </p>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Please share your feedback to help us improve Engine.
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="flex flex-col gap-1"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      {deleteEngineReasons.map((reason) => (
                        <FormItem
                          className="flex items-center space-x-3 space-y-0"
                          key={reason.value}
                        >
                          <FormControl>
                            <RadioGroupItem value={reason.value} />
                          </FormControl>
                          <FormLabel className="!text-foreground font-normal text-sm">
                            {reason.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-4" />

            {/* Feedback */}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="bg-card"
                      placeholder="Provide additional feedback"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="h-4" />

            <Alert variant="destructive">
              <AlertTitle>This action is irreversible!</AlertTitle>

              <AlertDescription className="!pl-0">
                <CheckboxWithLabel>
                  <Checkbox
                    checked={form.watch("confirmDeletion")}
                    onCheckedChange={(checked) =>
                      form.setValue("confirmDeletion", !!checked)
                    }
                  />
                  I understand that access to my local backend wallets and any
                  remaining funds will be lost.
                </CheckboxWithLabel>
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-end gap-3 border-t bg-card p-6">
            <Button onClick={close} variant="outline">
              Close
            </Button>
            <Button
              className="gap-2"
              disabled={
                !form.watch("confirmDeletion") ||
                deleteCloudHostedEngine.isPending
              }
              type="submit"
              variant="destructive"
            >
              {deleteCloudHostedEngine.isPending && (
                <Spinner className="size-4" />
              )}
              Permanently Delete Engine
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function EmptyEngineState(props: { team: Team; projectSlug: string }) {
  const [selectedTab, setSelectedTab] = useState<
    "self-hosted" | "cloud-hosted"
  >("cloud-hosted");

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card px-4 py-12 lg:px-6">
      <div className="mb-4 rounded-full border bg-card p-2">
        <EngineIcon className="size-6 text-muted-foreground" />
      </div>

      <h2 className="mb-1 font-semibold text-xl">No Engine instances found</h2>
      <p className="mb-6 max-w-lg text-center text-muted-foreground text-sm">
        Get started with one of the options below to add your first engine
        instance.
      </p>

      <div className="w-full max-w-md">
        <div className="mx-auto max-w-sm">
          <div className="grid grid-cols-2 gap-1 rounded-lg border p-1">
            <Button
              className={cn(selectedTab === "cloud-hosted" && "bg-accent")}
              onClick={() => setSelectedTab("cloud-hosted")}
              size="sm"
              variant="ghost"
            >
              Managed
            </Button>

            <Button
              className={cn(selectedTab === "self-hosted" && "bg-accent")}
              onClick={() => setSelectedTab("self-hosted")}
              size="sm"
              variant="ghost"
            >
              Self-hosted
            </Button>
          </div>
        </div>

        <div className="h-5" />

        {selectedTab === "self-hosted" && (
          <div className="flex flex-col text-center">
            <h3 className="mb-0.5 font-semibold text-base">
              Self-Hosted Engine
            </h3>
            <p className="text-muted-foreground text-sm">
              Add engine instance running on your own infrastructure.
            </p>
            <div className="h-4" />
            <div className="mt-auto">
              <Button
                asChild
                className="w-full gap-2"
                size="sm"
                variant="default"
              >
                <Link
                  href={`/team/${props.team.slug}/${props.projectSlug}/engine/dedicated/import`}
                >
                  Import self-hosted Engine
                  <ArrowRightIcon size={16} />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {selectedTab === "cloud-hosted" && (
          <div className="flex flex-col text-center">
            <h3 className="mb-0.5 font-semibold text-base">Managed Engine</h3>
            <p className="text-muted-foreground text-sm">
              Deploy a managed engine instance to your team. <br /> We recommend
              using Engine Cloud in most cases.
            </p>
            <div className="h-4" />
            <div className="mt-auto">
              <DedicatedEngineSubscriptionButton team={props.team} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-muted-foreground text-sm">
        Need help getting started? <br className="lg:hidden" />
        <Link
          className="text-foreground hover:underline"
          href="https://portal.thirdweb.com/engine"
          rel="noopener noreferrer"
          target="_blank"
        >
          View documentation
        </Link>
      </div>
    </div>
  );
}
