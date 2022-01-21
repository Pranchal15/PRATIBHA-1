import { db, storage } from "../../../firebase";
import { ref,uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc,setDoc,updateDoc } from "firebase/firestore"; 

async function uploadFile(fileObj,course,year,department,section,subject,midNo,email,title,fileName){
    let error=null;
    console.log(fileObj.type);

    const pra_ref= ref(
        storage,
        `${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`
    );
    
    // let pra_ref;
    // if(fileObj.type=="application/vnd.openxmlformats-officedocument.presentationml.presentation"){
    //     pra_ref = ref(
    //         storage,
    //         `${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}.pptx`
    //     );
    // }else{
    //     pra_ref = ref(
    //         storage,
    //         `${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`
    //     );
    // }

    await uploadBytes(pra_ref,fileObj)
    .then(async(snapshot) => {
        try {
            let subs=null;
            const docRef = doc(db, "users",email);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()){
                subs = docSnap.data()["subjects"];
                for(var i=0;i<subs.length;i++){
                    if(subs[i].subject===subject){
                        let s=subs[i];
                        if(midNo==="1"){
                            s.fileName1=fileName
                            s.topic=title
                            s.mid_1=snapshot.ref.fullPath;
                            subs[i]=s;
                        }else if(midNo==="2"){
                            s.fileName2=fileName
                            s.topic=title
                            s.mid_2=snapshot.ref.fullPath;
                            subs[i]=s;
                        }
                        break;                        
                    }                
                }
                try {
                    await updateDoc(docRef,{
                        subjects:subs,                        
                    });
                    let faculty=null;
                    console.log(`${course}_${year}_${department}_${section}`);
                    const subRef = doc(db,"subjects",`${course}_${year}_${department}_${section}`);
                    const docSnap = await getDoc(subRef);
                    if(docSnap.exists()){
                        console.log("AB");
                        subs = docSnap.data()["subjects"];
                        for(var j=0;j<subs.length;j++){
                            if(subs[j].subject===subject){
                                console.log("CD");
                                faculty = subs[j].facultyID;
                                break;                                
                            }              
                        }                        
                    }else{
                        return "Unknown Error Occured, Try Reuploading the file";
                    }
                    console.log(faculty); 
                    if(faculty!=null){
                        console.log(`${course}_${year}_${department}_${section}_${subject}`);
                        const facultyRef = doc(
                            db,`faculty/${faculty}/${course}_${year}_${department}_${section}_${subject}`,email.split('@')[0]);
                        if(midNo=="1"){
                            //TODO if mid1 is not submitted then setdoc in mid2
                            await setDoc(facultyRef,{
                                isSubmitted1:true,
                            })
                        }else if(midNo=="2"){
                            const doc =await getDoc(facultyRef);
                            if(doc.exists()){
                                await updateDoc(facultyRef,{
                                    isSubmitted2:true,
                                })
                            }else{
                                await setDoc(facultyRef,{
                                    isSubmitted2:true,
                                })
                            }                            
                        }
                    }else{
                        return "Unknown Error Occured, Try Reuploading the file";
                    }
                } catch (error) {
                    return error.code;                
                }
            }else{
                return "Student Enrollment Failed";             
            }            
        }catch(error){
            return error.code;            
        }
        console.log('Uploaded a blob or file!');        
        console.log(snapshot.ref.fullPath);        
    })
    .catch((err)=>{
      console.log(err.code);
      error=err;
    })
    return error;
}

async function getUploadedFile(course,year,department,section,subject,midNo,email) {
    let res={
        url:null,
        error:null,    
    }
    console.log(`${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`);
    await getDownloadURL(ref(storage,`${course}/${year}/${department}/${section}/${subject}/${midNo}/${email.split('@')[0]}`))
    .then((url) => {
        console.log(url);
        res.url=url;
    })
    .catch((error) => {
        res.error=error.code;    
    })
    return res;  
}

async function getUploadedFileByPath(path) {
    let res={
        url:null,
        error:null,    
    }
    await getDownloadURL(ref(storage,path))
    .then((url) => {
        console.log(url);
        res.url=url;
    })
    .catch((error) => {
        res.error=error.code;    
    })
    return res;  
}

export {uploadFile,getUploadedFile,getUploadedFileByPath}
