import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './admin.scss';

interface IURLShortenerProps {

}

class URLShortenerForm extends React.Component<IURLShortenerProps, undefined> {
    public render() {
        return (
            <form>
                <div className='form-group'>
                    <label htmlFor='urlField'>URL to be shortened</label>
                    <input className='form-control' type='text' id='urlField' placeholder='Enter URL' />
                </div>
                <button type='submit' className='btn btn-primary'>Submit</button>
            </form>
        );
    }
}

ReactDOM.render(<URLShortenerForm />, document.getElementById('root'));

// Write your code here!
console.log('Admin page');
