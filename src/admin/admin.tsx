import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './admin.scss';

// tslint:disable:max-line-length
const URL_REGEXP = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

interface IURLShortenerState {
    longUrl: string;
    isSubmitEnabled: boolean;
}

class URLShortenerForm extends React.Component<{}, IURLShortenerState> {

    public state: IURLShortenerState = {
        longUrl: '',
        isSubmitEnabled: false,
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
                <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={!this.state.isSubmitEnabled}>Shorten</button>
            </form>
        );
    }

    public handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        const longUrl = event.currentTarget.value;
        this.setState((prevState) => {
            return {
                ...prevState, longUrl,
                isSubmitEnabled: !!longUrl && URL_REGEXP.test(longUrl),
            };
        });
    }

    public handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert(`Shorten URL ${this.state.longUrl}`);
    }
}

ReactDOM.render(<URLShortenerForm />, document.getElementById('root'));
