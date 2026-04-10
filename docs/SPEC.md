# Jewish Engagement Database Spec

## Application High Level Goal

- **Goal:** Create an application that collects data for specific events from different Jewish orgs on their participants and then aggregates that data to create insights for multiple user types. This application will create a rich, ever-expanding view of Jewish engagement.

## Application User Goals

There are a number of user opportunities we are solving for:

- **Program managers** should:
  - Gain insight into the effectiveness of their events relative to other events they have run and those that other like-organizations have run.
  - Gain insight into the members inside of their organization for the purposes of understanding how to hone their product.
- **Operating organizational leaders** should:
  - Gain insight into the overall effectiveness of their organization's events to hold their event managers accountable and also to hold themselves accountable for the overall effectiveness of their organization's work.
  - Gain insight into who their organization is serving for the purposes of honing the organization's value proposition.
- **Communal leaders** should gain insight into the people in their community and how those people are served by the organizations in that community.
- **[Maybe] Communal marketers** should be given the capacity to understand how best to expose community members to the events.

## Principles

- **The application needs to make users feel confident** that the data they are uploading will never reveal private info. Data that is uploaded will contain an email address that will be added to a private database only accessible by the maker of the application. Every new user whose data is uploaded will have a unique ID created for them. That ID and their email address will be kept in this "private secure database". The "Anonymized people database" will contain their unique ID with a series of accumulated characteristics on that user that are generated over time. Other databases will be kept that are mentioned below.
- The application should seek to **minimize friction for users to enter data** regardless of the shape of that data.
- The application should seek to **create easy to understand actionable insight as quickly as possible**.

## Databases

In order to accommodate the use cases below the system will carry the following databases:

- **Private secure database** — Houses the identity of users in the system. This database will hold email addresses matched to system-generated user IDs.
- **Anonymized people database** — Houses an accumulated set of characteristics on people who have attended events or who are members of organizations. It will evolve and get updated as more events with participant data are added.
- **Event database** — Has a "row" for each event which includes characteristics of that event and also logs key outputs. Example fields could include:
  - Name
  - Short description
  - Long description
  - Attendees
  - Attendees by age (0-5, 6-10, 11-15, 16-20, 21-30, 31-40, ...)
  - Attendees by denomination (Reform, Just Jewish, Conservative, Orthodox, ...)
  - *Note: The system should reference the "anonymized people database" to look for relevant comparison points for event attendees.*

> **Open question:** Certain organizations might want to analyze their membership base. We might give certain orgs the ability to upload emails of their members to append them to the anonymized people database in order to allow them to see how those members interact with the Jewish world beyond their synagogue.

## Program Manager: Event Entry and Analysis User Story

**User Goal:** A program manager wants to analyze the data set of a group of people who attended an event.

### Signup Flow

1. The user reaches a web page that allows them to sign up for the service.
2. Signup can use Google auth or allow them to sign up using their work email address.
3. Upon clicking sign up the system should scan their email domain to find whether we recognize their organization name via an "organization database" that stores the names and a growing set of characteristics on each org. If it can't find their org it should make them sign their org up.
   - *Note: Need to eventually think about admin privileges on each org. An org could have a program manager who is able to upload and analyze event-specific results, but could also have an operating organizational leader who is able to look at events and membership across the org.*
   - Org sign up could include fields like:
     - Org name
     - Org type (standardized list)
     - Acceptable email domains (don't allow gmail, hotmail, etc.)
     - Org subtype — dependent on org type. A synagogue would have characteristics like "denomination" that a JCC would not. Need to figure out the type and subtype hierarchy.
   - The user should then be put into a **user database** that contains:
     - Their role (standardized set)
     - The organization they work for
     - Other relevant fields
4. There should be a validation flow that prompts the user to validate their email if they don't use Google auth.

### Event Logging Flow

1. The program manager is now signed in and can log a "new event."
2. They are prompted to enter structured information:
   - Event name (at their discretion, perhaps with hints on naming conventions)
   - Org name (not required if logged in; should use typeahead to prevent duplicate orgs)
   - Short event description
   - Long event description (optional)
   - Event date
   - Event type (prepopulates based on short/long description, but allows modification to fit a structured set of event types)
3. They are prompted to upload a spreadsheet of event attendees.
   - Ideally the spreadsheet will have proper column names, but the system (through AI) will be smart enough to discern what the columns say and what lives inside the columns.
   - *Idea: In future we might have a structured workflow that allows them to clean up their data on the spot.*
4. Expected columns include:
   - Name
   - Email
   - Age
   - Date of birth
   - Family members attending
   - Other variables

### Data Validation and Storage

1. The system prompts the user to validate the column fields in the spreadsheet.
   - It will look at the "anonymized people database" to find potential matches between existing fields and the uploaded data fields, showing the user how the system is generalizing those fields.
2. After validation, the system updates the relevant databases:
   - **Private secure database** — Checks if the email exists. If yes, retrieves the user ID. If not, creates a new user ID. Fields: Unique user ID, User email 1, Alternate user email 2, First name, Last name.
   - **Anonymized people database** — Appends/updates info for each user ID. When info confirms an existing attribute, notes multiple confirming sources. When data conflicts, notes the conflict. In addition to demographic data, records the event attended along with all event labels.
     - *Open question: Should conflicting data favor the most recent data set?*
   - **Event database** — Adds a row for the new event with characteristics and key outputs (same fields as described in the Databases section above).

### Output Generation

After logging all relevant data the system generates "outputs":

- **Event attendee profile** — Charts showing info on the event. The power of this view is that it shows not only uploaded variables but also composite data collected from other organizations.
  - Attendees by age
  - Attendees by denomination
  - What types of other events these attendees typically take part in
  - Other variables from the event database
- **Event comparison details** — Charts showing how the event compares to other like events.
  - Potential comparisons:
    - Attendance by event type (holiday event, Hanukkah event, etc.)
    - Age distribution by event type
  - *Note: Not sure of the right way to categorize event types.*

## Program Manager: Population Entry and Analysis User Story

**User Goal:** A program manager wants to upload information on a segment of its population agnostic of an event.

*This user story assumes the user is already logged in.*

1. There should be two icons on some kind of dashboard: one for event entry, the other for population entry.
2. When the program manager clicks "population entry" it prompts them to upload a spreadsheet. As long as the spreadsheet has an email address and some other columns of info, it can be used.
3. Example fields:
   - Number of kids
   - Spouse
   - Are they members
   - Type of membership
   - Demographic info (age, etc.)
4. The system prompts the user to validate the column fields.
5. Similar to the event flow, it updates the Private Secure database and the Anonymized People database in the same way.

## Operating Organizational Leader User Story

**User Goal:** Understand event performance and the characteristics of people who attend that organization's programs.

1. Organizational leader signs up and signs in, designating themselves as an organizational leader.
2. Organizational leader has a choice to click on:
   - Population profile
   - Event performance

### Event Performance

- Shown a screen with charts of aggregate data on event performance: age of attendees, denomination of attendees, what other orgs' events their attendees typically attend, and other relevant info.
- An event listing summarizes events their org put on with basic fields like event date, number of attendees, which user logged the event, and others.
- They can click into individual events to see information similar to what the program manager sees.

### Population Profile

- The application should over time learn about unique individuals who participate with that organization and develop a rich profile based on info from that org and from other orgs.
- **The population profile output should not reveal any PII.**
- A representative view could allow an organization to view the unique demographics of all of its members, then filter down to specific variables. For example, a JCC CEO could pull:
  - Do they belong to a synagogue
  - Denomination
  - Engagement per time period with JCC
  - Engagement per time period outside of JCC
  - Do they have a child that attends a Jewish Day School

## Unsolved Challenges

- **Family identification.** We will get a lot of parents in the database and need to understand when two people are spouses. In many cases the valuable data will be on the family unit, not the individual adult. We may hear that they have children and collect data on those children, but children won't have email addresses. Unclear how to treat children before they get email addresses and acknowledging that they are kids without as much agency as their parents.
- **Incentivizing data upload.** We might build in a mechanism where users from an org can't access the system's data until they upload some amount of their own data (similar to how Glassdoor used to work — you had to submit data on your own employer before seeing other data). We need to create as many incentives as possible for people to want to upload their own data in order for the system to be as rich as possible.
