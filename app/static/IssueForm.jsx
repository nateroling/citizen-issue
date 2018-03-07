class IssueForm extends React.Component {

    /*
    Placeholder and options for issue type.
    */
    static typePlaceholder = "Select an issue";
    static typeOptions = Object.freeze([
        "Cat Meowing",
        "Dog Barking",
        "Flooding",
        "Pot Hole",
        "Stop Sign Down",
    ]);

    static completionState = Object.freeze({
        incomplete: 0,
        success: 1,
        error: 2,
    });

    static postUrl = "/issues/";

    /*
    Maximally-simple email regex: https://stackoverflow.com/a/742455
    */
    static emailRegex = /^\S+@\S+\.\S+$/;


    /*
    Set up initial state.
    */
    constructor(props) {
        super(props);
        this.state = {
            completionState: IssueForm.completionState.incomplete,
            type: IssueForm.typePlaceholder,
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
            IssueForm.typeOptions.indexOf(this.state.type) != -1 &&
            this.state.message != "" &&
            this.state.name != "" &&
            this.state.phone != "" &&
            IssueForm.emailRegex.exec(this.state.email)
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
    - Sends the API request
    - Sets loading state

    */
    onSubmit = (event) => {
        event.preventDefault();
        if (!this.validate()) { return; }
        fetch(IssueForm.postUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                type: this.state.type,
                message: this.state.message,
                name: this.state.name,
                phone: this.state.phone,
                email: this.state.email
            })
        }).then(response => {
            if (!response.ok) { throw Error(response.statusText); }
            return response;
        }).then(response => {
            this.setState({
                type: IssueForm.typePlaceholder,
                message: "",
                name: "",
                phone: "",
                email: "",
                completionState: IssueForm.completionState.success,
            })
            // Clear our completion message after a timeout.
            setTimeout(() => {
                this.setState({
                    completionState: null
                })
            }, 2000);
        }).catch(error => {
            console.log(error);
            this.setState({
                completionState: IssueForm.completionState.error
            })
        });
    }

    /*
    Render the component.
    */
    render() {
        let statusMessage;
        switch (this.state.completionState) {
            case IssueForm.completionState.success:
                statusMessage = <div className="IssueForm__successMessage">Issue submitted. Thank you!</div>;
                break;
            case IssueForm.completionState.error:
                statusMessage = <div className="IssueForm__errorMessage">There was an error. Please reload and try again.</div>;
                break;
            default:
                statusMessage = null;
        }
        
        const selectTypeClasses = ["IssueForm__input", "IssueForm__type"];
        if (this.state.type == IssueForm.typePlaceholder) {
            // Allows us to style the placeholder value differently.
            selectTypeClasses.push("placeholder");
        }

        return (
            <form className="IssueForm" onSubmit={this.onSubmit}>
                <select value={this.state.type} onChange={this.onChange} name="type" className={selectTypeClasses.join(' ')} required>
                    <option disabled>{IssueForm.typePlaceholder}</option>
                    { IssueForm.typeOptions.map((issueType) => <option key={issueType}>{issueType}</option>) }
                </select>
                <textarea value={this.state.message} name="message" onChange={this.onChange} placeholder="Write your message..." className="IssueForm__input IssueForm__message" required></textarea>
                <hr className="IssueForm__divider" />
                <input value={this.state.name} onChange={this.onChange} type="text" name="name" placeholder="Name" className="IssueForm__input IssueForm__name" required />
                <input value={this.state.phone} onChange={this.onChange} type="text" name="phone" placeholder="Phone" className="IssueForm__input IssueForm__phone" required />
                <input value={this.state.email} onChange={this.onChange} type="text" name="email" placeholder="Email" className="IssueForm__input IssueForm__email" required />
                <input type="submit" disabled={ !this.validate() } value="Submit" className="IssueForm__input IssueForm__submit" required />
                { statusMessage  }
            </form>
        )
    }

}
