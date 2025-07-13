
import React from "react";


const PasswordInput = ({label, placeholder, className}) =>{
    return (
        <div className={`textInputDiv flex flex-col space-y-2 w-full ${className}`}>
            <label htmlFor={label} className="font-semibold">
                {label}
            </label>
            <input type="password"
            placeholder={placeholder}
            className="p-3 border border-gray-400 border-solid rounded placeholder-grey-500"
            id ={label}
            />

        </div> 

        );
}
export default PasswordInput;