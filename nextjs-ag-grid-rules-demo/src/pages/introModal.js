import { useEffect, useState } from 'react';

const IntroModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show modal on page load
    setShow(true);
  }, []);

  return (
    <>
      {show && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Background</h5>
                <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
              </div>
              <div className="modal-body">
                <p>This web app was created with Next.js, a React framework. This demos the use of AG Grid to display an Excel like
                    table whose cells can be edited/updated. As cells are updated, the values within that updated row are sent to a JSON 
                    Rules Engine, which calculates the Price column based on pre-defined rules. </p>
                <p>The Last JSON Rule which was applied based on the latest user update in the table can be seen in the area
                    at the bottom of the page for your reference. 
                </p>
                <p>This demo is meant to show how one would build an Excel like table for a website, in which various 
                    combinations of user selections are used to calculate a price. 
                </p>
                <p>The column names and values used are examples of Cloud Infrastructure selections which one would make to determine a 
                    total price for their cloud infrastructure.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShow(false)}>
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IntroModal;
