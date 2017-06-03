import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './admin.scss';

interface IURLShortenerState {
    longUrl: string;
}

class URLShortenerForm extends React.Component<{}, IURLShortenerState> {

    public state: IURLShortenerState = {
        longUrl: '',
    };

    private fieldId = `urlField_${Math.floor(Math.random() * 10000)}`;

    public render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className='form-group'>
                    <label htmlFor={this.fieldId}>URL to be shortened</label>
                    <input
                        className='form-control'
                        type='text'
                        id={this.fieldId}
                        placeholder='Enter URL'
                        value={this.state.longUrl}
                        onChange={this.handleChange} />
                </div>
                <button type='submit' className='btn btn-primary'>Shorten</button>
            </form>
        );
    }

    public handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({longUrl: event.currentTarget.value});
    }

    public handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert(`Shorten URL ${this.state.longUrl}`);
    }
}

ReactDOM.render(<URLShortenerForm />, document.getElementById('root'));
