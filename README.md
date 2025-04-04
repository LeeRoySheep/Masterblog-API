# Masterblog-API

Creating a Blog on Python with Flask Templates and API
and Using JWT Bearer Tokens for user authentication

## Installation

just enter    
> `pip3 install -r requirements.txt`     

to install all dependencies

## Usage

Start Backend with    
> `python3 /backend/backend_app.py`

and use either the <strong>`frontend_app.py`</strong>   
or use directly the <strong>API</strong>    
described as follows:

To add and update posts you need to be logged in as user or admin!

>User: 'MaxUser' with password: 'user'

, who can only write new posts and update his own posts or

>User: 'AdamAdmin' with password 'admin'
 
, who can also delete and update all posts. 

<span style='color: red;'>Please note that without the auth token and user you can only search 
and 
order posts!
</span>

## API

The API is accessible at http://localhost:5002/api/docs
I added all routes for usage here, so feel free and check it out.

In case you are a real pro, you can check the `masterblog.json` file,
in the `~/backend/static` folder to see the API usage.

## Anotations

If you have any Ideas how to optimize the program feel free and write to me,
I am always happy to learn.
If you like the code feel free to use it copy it or change it...

