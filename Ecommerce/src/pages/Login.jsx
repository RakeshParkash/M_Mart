import {React , useState} from 'react';
// import Icon from '../components/Icon';
import {Icon} from "@iconify/react";
import TextInput from '../components/shared/TextInput';
import PasswordInput from '../components/shared/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { makeUnauthenticatedPOSTRequest } from '../utils/server';
import { useCookies } from 'react-cookie';

const LoginComponent = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [cookie, setCookie] = useCookies(["token"]);
    const navigate = useNavigate();

    const login = async () => {
        
            const data = { phone, password };
            const response = await makeUnauthenticatedPOSTRequest(
                "/login",
                data
            );
            if (response && !response.err && !response.error) {
                const token = response.token;
                const date = new Date();
                date.setDate(date.getDate() + 30);
                setCookie("token", token, {path: "/" , expires: date});
                alert("Success");
                navigate("/home");
    
            } else {
                alert(response?.err || response?.error || "Registration failed");
            }
    
        };



    return (
        <>
    <div className='w-full h-full flex flex-col  items-center'>
            <div className="logo p-5 border-b border-solid border-gray-300 w-full flex justify-center">
                 <Icon icon="noto-v1:shopping-bags" width="150" />

            </div>
        <div className='InputRegion w-1/3 py-10 flex items-center justify-center flex-col'>

            <div className='font-bold mb-4'>To continue , log in to M. Mart</div>
            <TextInput 
                label="Phone Number" 
                placeholder="Phone number"
                className="my-2"
                value={phone}
                setValue={setPhone}
            />
            <PasswordInput
                label="Password"
                placeholder="password"
                className="my-2"
                value={password}
                setValue={setPassword}
            />
            <div className=' w-full flex items-center justify-end mt-6'>
            <button className='bg-green-400 font-semibold p-3 px-10 rounded-full '
                onClick={ (e) => {
                    e.preventDefault();
                    login();
                }}
            >
                LOG IN
            </button>
            </div>
            <div className='w-full border border-solid border-gray-300 mt-5' ></div>
            <div className='my-6 font-semibold text-lg'>
                Dont't have an account?
            </div>
            <Link to="/signup" className='w-full'>
                <div className='border border-gray-500 text-gray-500 font-bold w-full rounded-full flex items-center justify-center py-4'>
                    SIGN UP
                </div>
            </Link>
        </div>

    </div>
        </>
);

}; 

export default LoginComponent;
