import React,{useState} from 'react';
import styles from './input.module.css'

/**
 * 
 * @param {*} props textAlign,size,minLength,value,placeholder,name,type,onChange,error,maxLength are the supported props
 * You can pass an error msg to show an error below input field
 * @returns a custom styled input component.
 */
const InputField = ({ukey,textAlign,caps=false,size,value,placeholder,name,type,onChange,error,maxLength}) => {
    const [flag,setFlag] = useState(false);
    return ( 

        <div  key={ukey} className={styles.inputField}>
            {/* <label className={styles.label} htmlFor={name}>{placeholder}</label> */}
            <input id={name} size={size} style={{ textAlign: textAlign, textTransform: caps ? 'uppercase':"" }} onClick={() => {
                setFlag(true)    
            }} placeholder={!flag?placeholder:""} className={styles.input+" "+(error?styles.errorField:styles.normalField)} type={type} name={name} value={value} onChange={onChange} required/>
            <br />
            {error && <span className={styles.errorMsg} >{error}</span>}
            {error && <div style={{ height: 1 + 'rem' }} ></div>}
        </div>
     );
}
 
export default InputField;