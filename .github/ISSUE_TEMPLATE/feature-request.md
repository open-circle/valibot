name: 🚀 Feature Request
about: Suggest an idea or enhancement for Valibot
title: "[Feature Request]: "
labels: enhancement
assignees: fabian-hiller
body:
- type: textarea
  attributes:
    label: Description
    description: Please provide a detailed description of the feature you are requesting. Explain how it would benefit Valibot and its users.
  validations:
    required: false
- type: textarea
  attributes:
    label: Implementation Details (Optional)
    description: If you have any suggestions on how this feature could be implemented, provide details here. Code snippets or diagrams can be helpful.
  validations:
    required: false
- type: textarea
  attributes:
    label: Steps To Reproduce
    description: Steps to reproduce the behavior.
    placeholder: |
      1. In this environment...
      1. With this config...
      1. Run '...'
      1. See error...
  validations:
    required: false
- type: textarea
  attributes:
    label: Anything else?
    description: |
      Links? References? Anything that will give us more context about the issue you are encountering!

      Tip: You can attach images or log files by clicking this area to highlight it and then dragging files in.
  validations:
    required: false
