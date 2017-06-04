import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import './admin.scss';

// tslint:disable:max-line-length
const URL_REGEXP = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

interface IURLShortenerState {
    longUrl: string;
    key: string;
    isSubmitEnabled: boolean;
}

function generateRandomKey(): string {
    return 'xxxxxxx'.replace(/x/g, () => (Math.random() * 36 | 0).toString(36));
}

class URLShortenerForm extends React.Component<{}, IURLShortenerState> {

    private longUrl$ = new BehaviorSubject('');
    private key$ = new BehaviorSubject(generateRandomKey());

    private state$ = Observable
        .combineLatest(
            this.longUrl$, this.key$,
            (longUrl, key) => ({
                longUrl, key,
                isSubmitEnabled: !!longUrl && !!key && URL_REGEXP.test(longUrl),
            } as IURLShortenerState),
        )
    ;

    private subscription = new Subscription();
    private fieldId = `urlField_${Math.floor(Math.random() * 10000)}`;

    public componentWillMount() {
        this.subscription.add(this.state$.subscribe((state) => {
            this.setState(state);
        }));
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className='row'>
                    <div className='form-group col-lg-6'>
                        <label htmlFor={this.fieldId}>URL to be shortened</label>
                        <input
                            className='form-control'
                            type='url'
                            id={this.fieldId}
                            placeholder='Enter URL'
                            value={this.state.longUrl}
                            onChange={this.handleLongUrlChange} />
                    </div>
                    <div className='form-group col-lg-6'>
                        <label>Short URL</label>
                        <div className='input-group'>
                            <span className='input-group-addon'>https://kii.ski/</span>
                            <input
                                className='form-control'
                                type='text'
                                value={this.state.key}
                                onChange={this.handleKeyChange}
                                placeholder='Enter short key' />
                        </div>
                    </div>
                </div>
                <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={!this.state.isSubmitEnabled}>Shorten</button>
            </form>
        );
    }

    private handleLongUrlChange = (event: React.FormEvent<HTMLInputElement>) => {
        const longUrl = event.currentTarget.value;
        this.updateState({longUrl});
    }

    private handleKeyChange = (event: React.FormEvent<HTMLInputElement>) => {
        const key = event.currentTarget.value;
        this.updateState({key});
    }

    private updateState(state: {[key: string]: any}) {
        this.setState((prevState) => {
            const newState = {...prevState, ...state};
            const {longUrl, key} = newState;
            return {
                ...newState,
                isSubmitEnabled: !!longUrl && !!key && URL_REGEXP.test(longUrl),
            };
        });
    }

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert(`Shorten URL ${this.state.longUrl} as https://kii.ski/${this.state.key}`);
    }
}

ReactDOM.render(<URLShortenerForm />, document.getElementById('root'));
