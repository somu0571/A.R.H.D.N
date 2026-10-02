# ARHDN Model Weights Directory
Place the fine-tuned YOLOv12 model weights file here:
`./models/best.pt`

When `best.pt` is present, the AI service automatically loads the weights onto the resolved device (CUDA or CPU).
When `best.pt` is absent, the AI service operates in a clearly-flagged DEMO / MOCK MODE (`isMock=True`) to facilitate full pipeline testing without requiring massive binary weights.
