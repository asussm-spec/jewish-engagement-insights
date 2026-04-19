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
  { value: "worship_prayer", label: "Worship & Prayer" },
  { value: "learning_education", label: "Learning & Education" },
  { value: "holiday_calendar", label: "Holiday & Jewish Calendar" },
  { value: "community_social", label: "Community & Social" },
  { value: "youth_family", label: "Youth & Family" },
  { value: "arts_culture", label: "Arts & Culture" },
  { value: "health_wellness", label: "Health & Wellness" },
  { value: "tikkun_olam", label: "Tikkun Olam & Advocacy" },
  { value: "institutional", label: "Institutional" },
  { value: "other", label: "Other" },
];

const eventSubtypes: Record<string, { value: string; label: string }[]> = {
  worship_prayer: [
    { value: "shabbat_services", label: "Shabbat Services" },
    { value: "holiday_services", label: "Holiday Services" },
    { value: "daily_minyan", label: "Daily Minyan" },
    { value: "special_services", label: "Special Services" },
  ],
  learning_education: [
    { value: "torah_study", label: "Torah / Talmud Study" },
    { value: "adult_ed", label: "Adult Ed Course" },
    { value: "lecture_speaker", label: "Lecture / Speaker" },
    { value: "scholar_in_residence", label: "Scholar-in-Residence" },
    { value: "intro_judaism", label: "Intro to Judaism" },
    { value: "hebrew_class", label: "Hebrew Class" },
    { value: "religious_school", label: "Religious School" },
    { value: "early_childhood_ed", label: "Early Childhood Ed" },
    { value: "israel_education", label: "Israel Education" },
    { value: "holocaust_education", label: "Holocaust Education" },
  ],
  holiday_calendar: [
    { value: "shabbat_celebration", label: "Shabbat Celebration" },
    { value: "rosh_hashanah", label: "Rosh Hashanah" },
    { value: "yom_kippur", label: "Yom Kippur" },
    { value: "sukkot_simchat_torah", label: "Sukkot / Simchat Torah" },
    { value: "hanukkah", label: "Hanukkah" },
    { value: "purim", label: "Purim" },
    { value: "passover_seder", label: "Passover / Seder" },
    { value: "shavuot", label: "Shavuot" },
    { value: "yom_hashoah", label: "Yom HaShoah" },
    { value: "yom_haatzmaut", label: "Yom HaAtzmaut" },
    { value: "tu_bshvat", label: "Tu B'Shvat" },
  ],
  community_social: [
    { value: "shabbat_dinner", label: "Shabbat Dinner" },
    { value: "affinity_chavurah", label: "Affinity Group / Chavurah" },
    { value: "sisterhood_womens", label: "Sisterhood / Women's" },
    { value: "mens_club", label: "Men's Club" },
    { value: "young_adults", label: "Young Adults (20s/30s)" },
    { value: "seniors_active_adult", label: "Seniors / Active Adult" },
    { value: "young_families", label: "Young Families" },
    { value: "teen_social", label: "Teen Social" },
    { value: "lgbtq", label: "LGBTQ+" },
    { value: "inclusion", label: "Inclusion" },
    { value: "trip_mission", label: "Trip / Mission" },
  ],
  youth_family: [
    { value: "family_program", label: "Family Program" },
    { value: "children_6_12", label: "Children's (6-12)" },
    { value: "teen_13_17", label: "Teen (13-17)" },
    { value: "youth_group", label: "Youth Group" },
    { value: "camp", label: "Camp" },
    { value: "after_school", label: "After-School" },
    { value: "early_childhood_0_5", label: "Early Childhood (0-5)" },
    { value: "bnai_mitzvah", label: "B'nai Mitzvah Celebration" },
  ],
  arts_culture: [
    { value: "film", label: "Film Screening" },
    { value: "theater", label: "Theater / Performance" },
    { value: "music_concert", label: "Music / Concert" },
    { value: "visual_art", label: "Visual Art" },
    { value: "book_talk", label: "Book Talk / Author" },
    { value: "cultural_festival", label: "Cultural Festival" },
    { value: "dance", label: "Dance" },
  ],
  health_wellness: [
    { value: "fitness", label: "Fitness" },
    { value: "aquatics", label: "Aquatics" },
    { value: "yoga_mindfulness", label: "Yoga / Mindfulness" },
    { value: "sports_league", label: "Sports League" },
    { value: "wellness_workshop", label: "Wellness Workshop" },
  ],
  tikkun_olam: [
    { value: "volunteer", label: "Volunteer / Day of Service" },
    { value: "food_drive", label: "Food Drive" },
    { value: "community_organizing", label: "Community Organizing" },
    { value: "legislative_advocacy", label: "Legislative Advocacy" },
    { value: "environmental", label: "Environmental" },
    { value: "interfaith", label: "Interfaith" },
  ],
  institutional: [
    { value: "fundraising_gala", label: "Fundraising Gala" },
    { value: "auction", label: "Auction" },
    { value: "board_meeting", label: "Board Meeting" },
    { value: "membership_event", label: "Membership Event" },
    { value: "open_house", label: "Open House" },
    { value: "annual_campaign", label: "Annual Campaign" },
    { value: "donor_event", label: "Donor Event" },
  ],
};

const audienceOptions = [
  { value: "all_ages", label: "All Ages" },
  { value: "families", label: "Families" },
  { value: "infants_toddlers", label: "Infants / Toddlers (0-2)" },
  { value: "preschool", label: "Preschool (3-5)" },
  { value: "children", label: "Children (6-12)" },
  { value: "teens", label: "Teens (13-17)" },
  { value: "young_adults", label: "Young Adults (18-30)" },
  { value: "adults", label: "Adults" },
  { value: "seniors", label: "Seniors (65+)" },
];

const formatOptions = [
  { value: "in_person", label: "In Person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventSubtype, setEventSubtype] = useState("");
  const [audience, setAudience] = useState("");
  const [format, setFormat] = useState("in_person");
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
        event_subtype: eventSubtype || null,
        audience: audience || null,
        format: format || "in_person",
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
      <div className="mb-7">
        <div className="text-[12px] mb-1" style={{ color: "var(--ds-fg-muted)" }}>
          <Link
            href="/dashboard/events"
            className="no-underline hover:underline"
            style={{ color: "var(--ds-fg-muted)" }}
          >
            Events
          </Link>
          <span className="mx-1.5">/</span>
          <span>New</span>
        </div>
        <h1
          className="font-serif"
          style={{
            fontWeight: 500,
            fontSize: 32,
            letterSpacing: "-0.015em",
            color: "var(--ink-800)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Log a new event.
        </h1>
        <div
          style={{
            color: "var(--stone-500)",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          Enter the details of your event. You&apos;ll upload attendee data in
          the next step.
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="sr-only">Event details</CardTitle>
          <CardDescription className="sr-only">Event form</CardDescription>
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
                <Select value={eventType} onValueChange={(v) => { setEventType(v ?? ""); setEventSubtype(""); }}>
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

            {eventSubtypes[eventType] && (
              <div className="space-y-2">
                <Label>
                  Subtype{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select value={eventSubtype} onValueChange={(v) => setEventSubtype(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eventSubtypes[eventType].map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Audience{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select value={audience} onValueChange={(v) => setAudience(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v ?? "in_person")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
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
