import React from 'react'
import MainPage from '../images/indexinv.png'
const ReleaseDocs = () => {
    return(
        <div>
            <h1 className='pt-4'> Release Docs</h1>
            <div className='container'>
                <div className='row d-flex justify-content-center pt-4'>
                    <div style={{borderRadius: '10px', margin: '10px'}} className='col-md-3 border'>
                        <div className='row pt-4' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <p className='col-md'> Version 1.01 tirth  </p> <button className=' col-md custom-read'> Read ↗︎</button>
                        </div>
                        <div className='row d-flex justify-content-center'>
                            <img src={ MainPage } alt='temp' style={{width: '200px', marginTop:'60px'}}></img>
                        </div>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', marginTop:'100px', paddingBottom:'10px', fontSize: '12px'}}>
                            November 1st, 2024 | Author: Dev Patel
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );


}

export default ReleaseDocs;
