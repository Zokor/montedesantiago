<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public string $setupUrl, public string $temporaryPassword) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to '.config('app.name'))
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('You have been invited to access the CMS.')
            ->line('Use the button below to set your password and finish activating your account.')
            ->action('Set Password', $this->setupUrl)
            ->line('If you prefer, you can use this temporary password to sign in and update your password manually:')
            ->line('Temporary password: **'.$this->temporaryPassword.'**')
            ->line('This link will expire once you finish setting your password.');
    }
}
