console.log("Script loaded");

const API = "http://localhost:5000/api/auth";

const output = document.getElementById("output");

async function register(){

    const username =
        document.getElementById("registerUsername").value;

    const email =
        document.getElementById("registerEmail").value;

    const password =
        document.getElementById("registerPassword").value;

    const response = await fetch(

        API + "/register",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                username,
                email,
                password

            })

        }

    );

    const data = await response.json();

    output.textContent =
        JSON.stringify(data,null,4);

}

async function login(){

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    const response = await fetch(

        API + "/login",

        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email,
                password

            })

        }

    );

    const data = await response.json();

    output.textContent =
        JSON.stringify(data,null,4);

    if(data.token){

        localStorage.setItem(

            "token",

            data.token

        );

    }

}

async function getProfile(){

    const token =
        localStorage.getItem("token");

    const response = await fetch(

        API + "/profile",

        {

            headers:{

                Authorization:

                "Bearer " + token

            }

        }

    );

    const data = await response.json();

    output.textContent =
        JSON.stringify(data,null,4);

}