/** Normalized HTML input kinds used by extraction, resolution, and patching. */
export enum InputTypeEnum {
  Text = 'text',
  Textarea = 'textarea',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Tel = 'tel',
  Email = 'email',
  Number = 'number',
  Url = 'url',
  /** Custom button-triggered listbox widget (e.g. Workday's `role="listbox"` combobox). */
  ListboxButton = 'listboxButton',
}
