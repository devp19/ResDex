import React from 'react';
import { Link } from 'react-router-dom';


const Success = () => {

    return(
        <div>
                <h1 className='title center primary monarque top fade-in2'> Success! </h1>
                
                <p className='center primary fade-in2'>Ticket submitted successfully!</p>

                <div className='smaller-text center button-custom fade-in2'>
                              <Link className='custom' to='/'>Back Home</Link>
                            </div>
        </div>
    );

}

export default Success;