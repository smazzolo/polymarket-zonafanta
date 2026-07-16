"""Util condivisa "manda messaggio Telegram" — solo stdlib, zero dipendenze.

Usata da alert.py; pensata per essere riusata da un eventuale api/track.py
(runtime Python di Vercel) in Fase 5, così la logica Telegram vive qui e
basta. Token e chat_id arrivano SEMPRE da variabili d'ambiente
(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID): mai hardcoded, mai committati.
"""
import json
import os
import urllib.request


class ConfigMancante(RuntimeError):
    pass


def leggi_config():
    """Legge token e chat_id dall'ambiente. Solleva ConfigMancante se assenti."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    mancanti = [n for n, v in (("TELEGRAM_BOT_TOKEN", token),
                               ("TELEGRAM_CHAT_ID", chat_id)) if not v]
    if mancanti:
        raise ConfigMancante(
            "variabili d'ambiente mancanti: " + ", ".join(mancanti)
            + " (vanno nei GitHub Secrets / env Vercel, mai nel codice)")
    return token, chat_id


def invia_messaggio(testo, token=None, chat_id=None, timeout=15):
    """Invia un messaggio di testo semplice al bot. Solleva su errore HTTP/API."""
    if token is None or chat_id is None:
        token, chat_id = leggi_config()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=json.dumps({"chat_id": chat_id, "text": testo,
                         "disable_web_page_preview": True}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        esito = json.load(resp)
    if not esito.get("ok"):
        raise RuntimeError(f"Telegram ha risposto errore: {esito}")
    return esito
