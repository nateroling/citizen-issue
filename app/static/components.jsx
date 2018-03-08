/*
Constants
*/

// URL for POSTing new issues and GETing all issues.
const ISSUES_URL = "/issues/";

// Enum of possible states. The current state will be passed to the IssueForm to
// control display of success or error messages.
const REQUEST_STATE = { idle: 0, success: 1, error: 2, };

// Names of columns for the IssueTable.
const COLUMN_NAMES = ["Issue Type", "Message", "Name", "Phone", "Email"];

// Placeholder text for the Issue Type <select> element.
const ISSUE_TYPE_PLACEHOLDER = "Select an issue";

// Option text for the Issue Type <select> element.
const ISSUE_TYPE_OPTIONS = [ "Cat Meowing", "Dog Barking", "Flooding", "Pot Hole", "Stop Sign Down" ];

// Regular expression used to validate email addresses.
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;


/*
Request helpers. Simple wrappers around fetch().

postJson
- sets Accept header
- treats non-200 responses as errors.

getJson
- sets Accept and Content-Type headers
- stringifies JSON body
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


/*
React Components

IssueApp
- Handles api requests.
- Passes onSubmit handler to IssueForm to handle submission of issue data.
- Passes requestState to IssueForm to control display of error/success messages.

IssueForm
- Contains form controls.

IssueTable
- Gets issues from IssueApp and renders a table.

*/

class IssueApp extends React.Component {

    // Set initial state.
    constructor(props) {
        super(props);
        this.state = {
            issues: [],
            requestState: REQUEST_STATE.idle
        };
    }

    // Fetch a list of issues from the API.
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

    // Submit the issueData to the API.
    onSubmit = (issueData) => {
        postJson(ISSUES_URL, issueData).then(response => {
            this.onSuccess();
        }).catch(error => {
            console.log(error);
            this.setState({
                requestState: REQUEST_STATE.error
            })
        });
    }

    // Handle successful issue submission.
    // - Re-fetch the issues for display (inefficient but simple).
    // - Set success state to show success message, then clear it after timeout.
    onSuccess() {
        this.fetchIssues();

        this.setState({ requestState: REQUEST_STATE.success });
        setTimeout(() => {
            this.setState({ requestState: REQUEST_STATE.idle })
        }, 2000);
    }

    // Fetch issues when component first loads.
    componentDidMount() {
        this.fetchIssues();
    }

    // Render the issue form and table components.
    render() {
        return (
            <div className="App">
                <h1 className="App__title">Citizen Issue</h1>
                <h2 className="App__section_title">Submit an Issue</h2>
                <IssueForm onSubmit={(issueData) => this.onSubmit(issueData)} requestState={this.state.requestState} />
                <h2 className="App__section_title">Submitted Issues</h2>
                <IssueTable issues={this.state.issues}/>
            </div>
        );
    }
}

class IssueForm extends React.Component {

    // Default props.
    static defaultProps = {
        onSubmit: () => {},
        requestState: REQUEST_STATE.idle
    }


    // Set initial state.
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

    // Simple validation.
    // - valid issue type is selected
    // - message, name and phone are not blank
    // - email matches our regex
    validate = () => {
        return (
            ISSUE_TYPE_OPTIONS.indexOf(this.state.type) != -1 &&
            this.state.message != "" &&
            this.state.name != "" &&
            this.state.phone != "" &&
            EMAIL_REGEX.exec(this.state.email)
        )
    }

    // Change handler for form inputs.
    // - updates our component state when the inputs are changed.
    // - see https://reactjs.org/docs/forms.html for details.
    onChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    // Submit handler for the form.
    // - Sends issue data to onSubmit prop.
    // - Clears form
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

    // Render component.
    render() {
        // Determine the status message to show based on the requestState prop.
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

        // Set a `placeholder` class on the <select> element if the placeholder text is selected.
        // This is just used for styling.
        const selectTypeClasses = ["IssueForm__input", "IssueForm__type"];
        if (this.state.type == ISSUE_TYPE_PLACEHOLDER) {
            // Allows us to style the placeholder value differently.
            selectTypeClasses.push("placeholder");
        }

        // Render the form.
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

    // Default props.
    static defaultProps = {
        issues: []
    }

    // Set initial state.
    constructor(props) {
        super(props);
    }

    // Render the component.
    render() {
        // Build list of <th> from COLUMN_NAMES.
        const cols = COLUMN_NAMES.map((name) => <th key={name}>{name}</th>);

        // Build list of <tr> from props.issues
        const rows = this.props.issues.map((issue) => 
            <tr key={issue.id}>
                <td>{issue.type}</td>
                <td>{issue.message}</td>
                <td>{issue.name}</td>
                <td>{issue.phone}</td>
                <td>{issue.email}</td>
            </tr>
        );

        // Render the table.
        return (
            <div className="IssueTable">
                <table>
                    <thead><tr>{cols}</tr></thead>
                    <tbody>{rows}</tbody>
                </table>
            </div>
        )
    }

}
