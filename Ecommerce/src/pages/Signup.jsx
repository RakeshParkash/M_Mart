import React, { useState } from 'react';
import {useCookies} from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import {Icon} from "@iconify/react";
import TextInput from '../components/shared/TextInput';
import PasswordInput from '../components/shared/PasswordInput';
import { makeUnauthenticatedPOSTRequest } from '../utils/server';

const SignupComponent = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [cookie, setCookie] = useCookies(["token"]);
    const navigate = useNavigate();


    const signUp = async () => {
        

        const data = {  firstName, lastName , email , phone ,password  }

        if (!firstName || !lastName || !phone || !password) {
            alert("Please fill all required fields");
            return;
        }

        try {
        const response = await makeUnauthenticatedPOSTRequest(
            "/signup",
            data
        );

        if (response && response.token) {
            const token = response.token;
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setCookie("token", token, { path: "/", expires: date });
            localStorage.setItem("accessToken", token); 
            navigate("/home");
        } else {
            
            const errorMsg = response?.err || 
                           response?.error || 
                           response?.message || 
                           "Registration failed";
            alert(errorMsg);
        }
        } 
        catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred during registration");
        }
    };

    return (
        <>
    <div className='w-full h-full flex flex-col  items-center'>
            <div className="logo p-5 border-b border-solid border-gray-300 w-full flex justify-center">
                <Icon icon="noto-v1:shopping-bags" width="150" />

            </div>
        <div className='InputRegion w-1/3 py-10 flex items-center justify-center flex-col'>

            <div className='font-bold mb-4'>Sign up for free  to start buying groceries.</div>
            <div className='w-full flex space-x-8'>
            <TextInput 
                label="First Name" 
                placeholder="Enter your First Name"
                className="my-6"
                value={firstName}
                setValue={setFirstName}
            />
            <TextInput 
                label="Last Name" 
                placeholder="Enter your Last Name"
                className="my-6"
                value={lastName}
                setValue={setLastName}
            />
            </div>
            <TextInput 
                label="Email address" 
                placeholder="Enter your Email address"
                className="my-6"
                value={email}
                setValue={setEmail}
            />
            <TextInput 
                label="phone" 
                placeholder="Enter your phone No"
                className="my-6"
                value={phone}
                setValue={setPhone}
            />
            <PasswordInput
                label="Create Password"
                placeholder="Enter a strong Password here"
                value={password}
                setValue={setPassword}
            />

            <div className=' w-full flex items-center justify-center mt-6'>
            <button className='bg-green-400 font-semibold p-3 px-10 rounded-full cursor-pointer'
                onClick={ (e) => {
                    e.preventDefault();
                    signUp();
                    }
                }
            >
                SIGN UP
            </button>
            </div>
            <div className='w-full border border-solid border-gray-300 mt-5' ></div>
            <div className='my-6 font-semibold text-lg'>
                Already have an account?
            </div>
            <Link to="/login" className='w-full'>
                <div className='border border-gray-500 text-gray-500 font-bold w-full rounded-full flex items-center justify-center py-4'>
                    LOG IN 
                </div>
            </Link>
        </div>

    </div>
        </>
);

}; 

export default SignupComponent;
