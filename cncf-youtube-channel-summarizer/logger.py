import logging
import os


def setup_logger(name, level=None):
    if level:
        level_value = int(level)
    else:
        level_value = int(os.environ.get("SEINE_SAILOR_LOG_LEVEL", logging.INFO))
    logger = logging.getLogger(name)
    logger.setLevel(level_value)

    handler = logging.StreamHandler()
    handler.setLevel(level_value)

    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    return logger