const ISSUES_URL = "/issues/";
const REQUEST_STATE = Object.freeze({
    idle: 0,
    success: 1,
    error: 2,
});
const COLUMN_NAMES = ["Issue Type", "Message", "Name", "Phone", "Email"];
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const ISSUE_TYPE_PLACEHOLDER = "Select an issue";
const ISSUE_TYPE_OPTIONS = [ "Cat Meowing", "Dog Barking", "Flooding", "Pot Hole", "Stop Sign Down" ];

/*
Simple GET wrapper around fetch
- sets Accept header
- treats non-200 responses as errors.
*/
function getJson(url) {
    return fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    }).then(response => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
    });
}

/*
Simple POST wrapper around fetch
- sets Accept and Content-Type headers
- stringifies JSON body
- treats non-200 responses as errors.
*/
function postJson(url, body) {
    return fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            'Content-Type': "application/json"
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
    });
}

class IssueApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            issues: [],
            requestState: REQUEST_STATE.idle
        };
    }

    fetchIssues() {
        getJson(ISSUES_URL).then(response => {
            response.json().then(issues => {
                this.setState({issues: issues});
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    }

    onSubmit = (issueData) => {
        postJson(ISSUES_URL, issueData).then(response => {
            this.onSuccess();
        }).catch(error => {
            this.onError();
            console.log(error);
            this.setState({
                requestState: REQUEST_STATE.error
            })
        });
    }

    /*
    Handle successful issue submission.
    - Re-fetch the issues for display (inefficient but simple).
    - Set success state to show success message, then clear it after a timeout.
    */
    onSuccess() {
        this.fetchIssues();

        this.setState({ requestState: REQUEST_STATE.success });
        setTimeout(() => {
            this.setState({ requestState: REQUEST_STATE.idle })
        }, 2000);
    }

    /*
    Fetch issues when component first loads.
    */
    componentDidMount() {
        this.fetchIssues();
    }

    /*
    Render the issue form and table components.
    - Pass onSubmit handler and request state (idle, success, error) to form.
    - Pass list of issues to IssueTable.
    */
    render() {
        return (
            <div className="App">
                <h1 className="App__title">Citizen Issue</h1>
                <IssueForm onSubmit={(issueData) => this.onSubmit(issueData)} requestState={this.state.requestState} />
                <IssueTable issues={this.state.issues}/>
            </div>
        );
    }
}

class IssueForm extends React.Component {

    static defaultProps = {
        onSubmit: () => {},
        requestState: REQUEST_STATE.idle
    }


    /*
    Set up initial state.
    */
    constructor(props) {
        super(props);
        this.state = {
            type: ISSUE_TYPE_PLACEHOLDER,
            message: "",
            name: "",
            phone: "",
            email: ""
        };
    }

    /*
    Simple validation.
    - valid issue type is selected
    - message, name and phone are not blank
    - email matches our regex
    */
    validate = () => {
        return (
            ISSUE_TYPE_OPTIONS.indexOf(this.state.type) != -1 &&
            this.state.message != "" &&
            this.state.name != "" &&
            this.state.phone != "" &&
            EMAIL_REGEX.exec(this.state.email)
        )
    }

    /*
    Change handler for form inputs.
    - updates our component state when the inputs are changed.
    - see https://reactjs.org/docs/forms.html for details.
    */
    onChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    /*
    Submit handler for the form.
    - Sends issue data to provided onSubmit handler
    - Clears form
    */
    onSubmit = (event) => {
        event.preventDefault();
        // POST is handled by parent component.
        this.props.onSubmit({
            type: this.state.type,
            message: this.state.message,
            name: this.state.name,
            phone: this.state.phone,
            email: this.state.email
        });

        // Clear form.
        this.setState({
            type: ISSUE_TYPE_PLACEHOLDER,
            message: "",
            name: "",
            phone: "",
            email: ""
        })
    }

    /*
    Render the component.
    */
    render() {
        let statusMessage;
        switch (this.props.requestState) {
            case REQUEST_STATE.success:
                statusMessage = <div className="IssueForm__successMessage">Issue submitted. Thank you!</div>;
                break;
            case REQUEST_STATE.error:
                statusMessage = <div className="IssueForm__errorMessage">There was an error. Please reload and try again.</div>;
                break;
            default:
                statusMessage = null;
        }

        const selectTypeClasses = ["IssueForm__input", "IssueForm__type"];
        if (this.state.type == ISSUE_TYPE_PLACEHOLDER) {
            // Allows us to style the placeholder value differently.
            selectTypeClasses.push("placeholder");
        }

        return (
            <form className="IssueForm" onSubmit={this.onSubmit}>
                <select value={this.state.type} onChange={this.onChange} name="type" className={selectTypeClasses.join(' ')} required>
                    <option disabled>{ISSUE_TYPE_PLACEHOLDER}</option>
                    {ISSUE_TYPE_OPTIONS.map((issueType) => <option key={issueType}>{issueType}</option>)}
                </select>
                <textarea value={this.state.message} name="message" onChange={this.onChange} placeholder="Write your message..." className="IssueForm__input IssueForm__message" required></textarea>
                <hr className="IssueForm__divider" />
                <input value={this.state.name} onChange={this.onChange} type="text" name="name" placeholder="Name" className="IssueForm__input IssueForm__name" required />
                <input value={this.state.phone} onChange={this.onChange} type="text" name="phone" placeholder="Phone" className="IssueForm__input IssueForm__phone" required />
                <input value={this.state.email} onChange={this.onChange} type="text" name="email" placeholder="Email" className="IssueForm__input IssueForm__email" required />
                <input type="submit" disabled={!this.validate()} value="Submit" className="IssueForm__input IssueForm__submit" required />
                {statusMessage}
            </form>
        )
    }

}

class IssueTable extends React.Component {

    static defaultProps = {
        issues: []
    }

    /*
    Set up initial state.
    */
    constructor(props) {
        super(props);
    }

    /*
    Render the component.
    */
    render() {
        const cols = COLUMN_NAMES.map((name) => <th key={name}>{name}</th>);

        const rows = this.props.issues.map((issue, idx) => 
            <tr key={idx}>
                <td>{issue.type}</td>
                <td>{issue.message}</td>
                <td>{issue.name}</td>
                <td>{issue.phone}</td>
                <td>{issue.email}</td>
            </tr>
        );

        return (
            <table className="IssueTable">
                <thead><tr>{cols}</tr></thead>
                <tbody>{rows}</tbody>
            </table>
        )

    }

}
