I've established a basic app skeleton for the hackathon. The entry point is main.py, this links to app.py which will hold any pages we will make.

There is a requirements.py to download the required packages for the app. Make sure to update this if you add any packages to the app. Best way to do this is via pipreqs. https://stackoverflow.com/questions/31684375/automatically-create-file-requirements-txt

You can download all the packages by running the command
` pip install -r requirements.txt`

I have setup a MongoDB atlas database. I'll give the information on the day but ill add an env.example for now. On the day you will need to create a local .env file from the .example

## Folders

GUI - Hold the main app.py and any pages/widgets that we need.

Services - Any helper functions that we need e.g connecting to the DB, searching, filtering etc.

External Docs - Any documentation you think may be useful

I think it may be useful to also store the powerpoint in the github repo, may just need to be careful with changes as obviously git can't handle changes to the powerpoint.
