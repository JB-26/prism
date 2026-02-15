# Prism

## Executive summary

Prism is a web application that is designed to allow users to upload CSV files,
and receive a suitable interactive chart along with an executive summary that
was suggested by Claude.

The purpose of Prism is to provide fast and accurate analytics, all while ensure
that the human remains a subject matter expert and can change the chart and edit
the executive summary if they wish.

Prism is a 'Human in the loop' application, and is designed to empower the user,
not replace them.

### Core flow

- User uploads CSV
- Prism parses and validates data
- Claude picks which chart would be suitable for the data, and gnerates the
  appropriate Chart.js code
- Claude generates an executive summary based on the data
- This is all displayed in a dashboard view
- The user can then save the a copy of the chart and executive summary that can
  be easily shared with others

## Technical considerations

Prism will be developed using the following tech stack:

- Runtime: Deno
- Framework: NextJS
- Language: TypeScript
- AI: Anthropic SDK (claude-haiku-4-5-20251001)
- Styling: Tailwind
- Packages: Chart.js

## Testing

There will be unit tests included that use Deno's own testing library. The user
stories included should act as a guide to what to test.

### Branching strategy

Git will be used to manage branches to allow new features to be developed.

### Security considerations

Given this application involves allowing users to upload files to be analysed,
there needs to be limitations to what a user could upload:

- The user is **restricted to uploading CSV files only**
- The file should be **no larger than 3MB**
- **There must be an `.env` file to store the API keys for Claude**

## User Experience & Styling

As Prism is intended for professional use, the theme should reflect this (black
and white)

The font used should be what's installed on the user's machine. The following
CSS should be taken into consideration for this request:

```css
font-family:
  -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
  Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
```

The buttons should use colours to indicate an action, for example:

- A green button to encourage the user to upload a file
- A red button to delete the chart
- A yellow button to edit an executive summary or chart

The colours used should clearly convey what the button could do.

As this application is designed for professional use, this application should
**not** support mobile devices.

## User Stories

Use these stories to create features and unit tests for the Prism application.

### Opening the application

Given I enter the URL for the index page When the page finishes loading Then the
application is displayed And I can the application's name; Prism And I can see a
button to attach a CSV file And I can see a button to send the attachments to
Claude

Given I open the application When I see the header Then I can see the
application name And I see a link to the about page

Given I open the application When I see the footer Then I see a link to Joshua
Blewitt's website (https://www.joshblewitt.dev/)

### Attaching a CSV file

Given I click the button to attach a file When the file explorer opens Then I
can select a CSV file

Given I have clicked the button to attach a file And I can see the file explorer
When I attempt to attach the CSV file Then the name of the file is displayed on
the application, to confirm to the user what file is going to be uploaded

Given I have clicked the button to attach a file And I can see the file explorer
When I attempt to attach a file that isn't a CSV (i.e. .md) Then the application
tells the user to upload a CSV file

Given I have clicked the button to attach a file And I can see the file explorer
When I attempt to attach the CSV file, but it's greater than 3MB Then the
application tells the user to upload a file 3MB or less.

### Uploading a file

Given I have attached a CSV file When I click on the 'Upload' button Then the
page will display 'Thinking...' And the dots will have an animation to indicate
that Claude is thinking

### Displaying the results

Given I have uploaded a CSV file And I am waiting for the analysis to complete
When the chart and summary is ready to be displayed Then the page will use a
smooth transition animation to show the results And the results are presented in
a dashboard user interface

Given I am viewing the reuslts dashboard When the page loads Then I can see an
executive summary, a chart created using chart.js and an option to save the
chart and the summary.

Given I am viewing the results dashboard When I move my mouse over data points
on the chart Then a tooltip appears

### Editing the chart

Given I am viewing the results dashboard And I want to edit the chart When I
look at the chart displayed Then there will be an edit button with a pencil icon

Given I want to edit the chart When I click the edit button Then a dropdown list
of charts appears

Given I want to edit the chart And I have already clicked edit And can see the
dropdown list of charts When I choose the desired chart Then the chart changes
to the newly chosen chart

### Executive summary

Given I am viewing the results dashboard When I look to the executive summary
Then the executive summary should be displayed in a text box, that has a border
with a modern style And there will be an edit button with a pencil icon

Given I am viewing the results dashboard When I click on the edit button Then
the executive summary should be allowed to be changed by the user And the edit
button changes to display 'Save' with a save icon

Given I am editing the executive summary When I have finished editing And press
the save button Then the changes are saved And the save button changes back to
the edit button

### Saving the results

Given I am viewing the results dashboard When I click on the save button Then
the file explorer will appear And will allow me to save a copy of the chart and
executive summary

Given I open the downloaded file When it is rendered in the web browser Then the
chart and executive summary are displayed And the chart and summary **cannot**
be edited
