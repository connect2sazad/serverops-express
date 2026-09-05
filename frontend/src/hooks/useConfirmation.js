import { useContext } from "react";

import ConfirmationContext from "../components/ConfirmationContext";

export default function useConfirmation(){
    const context = useContext(ConfirmationContext);

    if(!context){
        throw new Error(
            'useConfirmation must be used inside ConfirmationProvider.'
        );
    }

    return context;
}