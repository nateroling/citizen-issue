
class IssueForm extends React.Component {
    
    render() {
        return (
            <form className="IssueForm">
                <select name="type" defaultValue="Select an issue" className="IssueForm__input IssueForm__type" required>
                    <option disabled hidden>Select an issue</option>
                    <option>Cat Meowing</option>
                    <option>Dog Barking</option>
                    <option>Flooding</option>
                    <option>Pot Hole</option>
                    <option>Stop Sign Down</option>
                </select>
                <textarea name="message" placeholder="Write your message..." className="IssueForm__input IssueForm__message" required></textarea>
                <hr className="IssueForm__divider" />
                <input type="text" name="name" placeholder="Name" className="IssueForm__input IssueForm__name" required />
                <input type="text" name="phone" placeholder="Phone" className="IssueForm__input IssueForm__phone" required />
                <input type="text" name="email" placeholder="Email" className="IssueForm__input IssueForm__email" required />
                <input type="submit" value="Submit" className="IssueForm__input IssueForm__submit" required />
            </form>
        )
    }
}
