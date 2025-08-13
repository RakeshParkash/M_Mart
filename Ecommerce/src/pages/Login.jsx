import { React, useState } from 'react';
import { Icon } from "@iconify/react";
import TextInput from '../components/shared/TextInput';
import PasswordInput from '../components/shared/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { makeUnauthenticatedPOSTRequest } from '../utils/server';
import { useCookies } from 'react-cookie';

const LoginComponent = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [cookies, setCookie] = useCookies(["token"]);
    const navigate = useNavigate();

    const login = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!phone || !password) {
            setError("Phone and password are required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await makeUnauthenticatedPOSTRequest("/login", {
                phone,
                password
            });

            if (response && response.token) {
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 30);
                
                setCookie("token", response.token, {
                    path: "/",
                    expires: expirationDate,
                    secure: true,
                    sameSite: 'strict'
                });
                
                navigate("/home");
            } else {
                setError(response?.message || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full h-full flex flex-col items-center'>
            <div className="logo p-5 border-b border-solid border-gray-300 w-full flex justify-center">
                <Icon icon="noto-v1:shopping-bags" width="150" />
            </div>
            
            <div className='InputRegion w-1/3 py-10 flex items-center justify-center flex-col'>
                <div className='font-bold mb-4'>To continue, log in to M. Mart</div>
                
                {error && (
                    <div className="mb-4 text-red-500 text-sm w-full text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={login} className="w-full">
                    <TextInput 
                        label="Phone Number" 
                        placeholder="Phone number"
                        className="my-2"
                        value={phone}
                        setValue={setPhone}
                        required
                    />
                    
                    <PasswordInput
                        label="Password"
                        placeholder="Password"
                        className="my-2"
                        value={password}
                        setValue={setPassword}
                        required
                    />
                    
                    <div className='w-full flex items-center justify-end mt-6'>
                        <button 
                            type="submit"
                            className={`bg-green-400 font-semibold p-3 px-10 rounded-full ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'LOGGING IN...' : 'LOG IN'}
                        </button>
                    </div>
                </form>

                <div className='w-full border border-solid border-gray-300 mt-5'></div>
                
                <div className='my-6 font-semibold text-lg'>
                    Don't have an account?
                </div>
                
                <Link to="/signup" className='w-full'>
                    <div className='border border-gray-500 text-gray-500 font-bold w-full rounded-full flex items-center justify-center py-4'>
                        SIGN UP
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default LoginComponent;