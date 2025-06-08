import React from 'react'
import MainPage from '../images/indexinv.png'
const ReleaseDocs = () => {
    return(
        <div>
            <h1 className='pt-4 primary'> Release Docs</h1>
            <div className='horizontal-line'></div>
            <div className='container'>
            <h2 className='pt-4 mt-4 primary'> Version 1</h2>
              
                <div className='row d-flex justify-content-left pt-4'>
                    <div style={{borderRadius: '10px', margin: '10px'}} className='col-md-3 box border'>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <p className='col-md monarque primary'> V1.01 </p>
                        </div>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <button className=' col-md custom-view'> Read ↗︎</button>
                        </div>
                        {/* <div className='row d-flex justify-content-center'>
                            <img src={ MainPage } alt='temp' style={{width: '200px', marginTop:'60px'}}></img>
                        </div> */}
                        <div className='row primary' style={{marginLeft: '10px', marginRight: '10px', marginTop:'50px', paddingBottom:'10px', fontSize: '12px'}}>
                            November 1st, 2024 | Author: Dev Patel
                        </div>
                    </div>






                    <div style={{borderRadius: '10px', margin: '10px'}} className='col-md-3 box border'>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <p className='col-md monarque primary'> V1.01 </p>
                        </div>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <button className=' col-md custom-view'> Read ↗︎</button>
                        </div>
                        {/* <div className='row d-flex justify-content-center'>
                            <img src={ MainPage } alt='temp' style={{width: '200px', marginTop:'60px'}}></img>
                        </div> */}
                        <div className='row primary' style={{marginLeft: '10px', marginRight: '10px', marginTop:'50px', paddingBottom:'10px', fontSize: '12px'}}>
                            November 1st, 2024 | Author: Dev Patel
                        </div>
                    </div>






                    <div style={{borderRadius: '10px', margin: '10px'}} className='col-md-3 box border'>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <p className='col-md monarque primary'> V1.01 </p>
                        </div>
                        <div className='row' style={{marginLeft: '10px', marginRight: '10px', fontSize: '30px'}}>
                            <button className=' col-md custom-view'> Read ↗︎</button>
                        </div>
                        {/* <div className='row d-flex justify-content-center'>
                            <img src={ MainPage } alt='temp' style={{width: '200px', marginTop:'60px'}}></img>
                        </div> */}
                        <div className='row primary' style={{marginLeft: '10px', marginRight: '10px', marginTop:'50px', paddingBottom:'10px', fontSize: '12px'}}>
                            November 1st, 2024 | Author: Dev Patel
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );


}

export default ReleaseDocs;
