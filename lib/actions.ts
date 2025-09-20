import { toast } from "sonner";

function onSubmit(data: z.infer<typeof schema>, csrfToken: string) {
  if (!csrfToken) {
    toast.error("Security token missing. Please refresh and try again.");
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ ...data, csrfToken }),
  })
    .then(async (res) => {
      if (res.ok) {
        toast.success("Logged in successfully!");
        props.onOpenChange?.(false);
        form.reset();
        setCsrfToken(""); // Reset token
        router.refresh();
      } else {
        toast.error(`Login failed: ${(await res.json()).error}`);
      }
    })
    .catch((error) => {
      toast.error(`An error occurred: ${error.message}`);
    });
}
