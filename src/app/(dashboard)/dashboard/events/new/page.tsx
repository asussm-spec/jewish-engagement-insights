"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const eventTypes = [
  { value: "holiday", label: "Holiday" },
  { value: "shabbat", label: "Shabbat" },
  { value: "educational", label: "Educational" },
  { value: "social", label: "Social" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "family", label: "Family" },
  { value: "youth", label: "Youth" },
  { value: "cultural", label: "Cultural" },
  { value: "worship", label: "Worship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
];

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's org
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      setError("You need to set up your organization first.");
      setLoading(false);
      return;
    }

    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        name,
        short_description: shortDesc || null,
        long_description: longDesc || null,
        event_date: eventDate,
        event_type: eventType || "other",
        organization_id: profile.organization_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Navigate to the upload step for this event
    router.push(`/dashboard/events/${event.id}/upload`);
  }

  return (
    <div>
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Log a new event</CardTitle>
          <CardDescription>
            Enter the details of your event. You&apos;ll upload attendee data in
            the next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Event name</Label>
              <Input
                id="name"
                placeholder="e.g. Hanukkah Family Celebration 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Event type</Label>
                <Select value={eventType} onValueChange={(v) => setEventType(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc">Short description</Label>
              <Input
                id="shortDesc"
                placeholder="Brief summary of the event"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDesc">
                Long description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="longDesc"
                placeholder="More detail about the event, goals, activities..."
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name || !eventDate}
              >
                {loading ? "Creating..." : "Continue to upload attendees"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
