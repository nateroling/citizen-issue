class IssueForm extends React.Component {

    /*
    An IssueForm can be in one of three possible modes.
    */
    static mode = Object.freeze({
        invalid:    0, // Initial mode. Fields are empty or invalid.
        valid:      1, // All fields are valid. Submit button enabled.
        submitting: 2, // Submitting to the server.
    });

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

    /*
    Maximally-simple email regex: https://stackoverflow.com/a/742455
    */
    static emailRegex = /^\S+@\S+$/;


    /*
    Set up initial state for mode and form values.
    */
    constructor(props) {
        super(props);
        this.state = {
            mode: IssueForm.mode.invalid,
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
            IssueForm.typeOptions.find(this.state.type) &&
            this.state.message != "" &&
            this.state.name != "" &&
            this.state.phone != "" &&
            IssueForm.emailRegex.exec(this.state.email)
        )
    }

    /*
    onChange handler for form inputs.
    - updates our component state when the inputs are changed.
    - see https://reactjs.org/docs/forms.html for details.
    - also validates form and updates our mode.
    */
    onChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });

        // Set mode (invalid or valid).
        this.setState({
            'mode': (this.validate() ? IssueForm.mode.valid : IssueForm.mode.invalid)
        })
    }

    /*
    Render the component.
    */
    render() {
        let statusMessage;
        switch (this.state.completionState) {
            case IssueForm.completionState.success:
                statusMessage = <div class="IssueForm__successMessage">Issue submitted. Thank you!</div>;
                break;
            case IssueForm.completionState.error:
                statusMessage = <div class="IssueForm__errorMessage">There was an error. Please reload and try again.</div>;
                break;
            default:
                statusMessage = null;
        }
        
        return (
            <form className="IssueForm">
                <select value={this.state.type} onChange={this.onChange} name="type" className="IssueForm__input IssueForm__type" required>
                    <option disabled hidden>{IssueForm.typePlaceholder}</option>
                    { IssueForm.typeOptions.map((issueType) => <option key={issueType}>{issueType}</option>) }
                </select>
                <textarea name="message" onChange={this.onChange} placeholder="Write your message..." className="IssueForm__input IssueForm__message" required></textarea>
                <hr className="IssueForm__divider" />
                <input value={this.state.name} onChange={this.onChange} type="text" name="name" placeholder="Name" className="IssueForm__input IssueForm__name" required />
                <input value={this.state.phone} onChange={this.onChange} type="text" name="phone" placeholder="Phone" className="IssueForm__input IssueForm__phone" required />
                <input value={this.state.email} onChange={this.onChange} type="text" name="email" placeholder="Email" className="IssueForm__input IssueForm__email" required />
                <input type="submit" disabled={ this.state.mode != IssueForm.mode.valid } value="Submit" className="IssueForm__input IssueForm__submit" required />
                { statusMessage  }
            </form>
        )
    }

}
