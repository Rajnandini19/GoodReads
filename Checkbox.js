import React, {useState, useEffect} from "react";

const Checkbox = ({categories, handleFilters}) => {
    const [checked, setChecked] = useState([])

//this will be fired when onchange event is happening on input
    const handleToggle = c => () => {
        //return the first index or-1
       const currentCategoryId = checked.indexOf(c) 
       const newCheckedCategoryId = [...checked]
       //if currently checked was not already in checked state > push
       //else pull/take off
       if(currentCategoryId===-1)
       {
           newCheckedCategoryId.push(c)
       }
       else
       {
           newCheckedCategoryId.splice(currentCategoryId,1)
       }
    //    console.log(newCheckedCategoryId)
       setChecked(newCheckedCategoryId)
       handleFilters(newCheckedCategoryId)
    }

    return categories.map((c,i) => (
        <li key={i} className="list-unstyled">
            <input  
               type="checkbox"
               className="form-check-input"
               onChange={handleToggle(c._id)}
               value={checked.indexOf(c._id === -1)}
            />
            <label className="form-check-label">{c.name}</label>
        </li>
    ))
}


export default Checkbox;